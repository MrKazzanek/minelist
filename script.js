document.addEventListener('DOMContentLoaded', () => {

    // --- SELEKTORY DOM ---
    const projectList = document.getElementById('project-list');
    const farmList = document.getElementById('farm-list');
    const emptyProjectListMessage = document.getElementById('empty-project-list-message');
    const emptyFarmListMessage = document.getElementById('empty-farm-list-message');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const addNewBtn = document.getElementById('add-new-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    // Elementy modala formularza
    const formModal = document.getElementById('form-modal');
    const modalTitle = document.getElementById('modal-title');
    const itemForm = document.getElementById('item-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const itemIdInput = document.getElementById('item-id');
    const itemTypeSelect = document.getElementById('item-type');
    const itemNameInput = document.getElementById('item-name');
    const itemStatusSelect = document.getElementById('item-status');

    // Elementy modala potwierdzenia
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const deleteMessage = document.getElementById('delete-message');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    // Elementy modala usunięcia wszystkiego
    const confirmDeleteAllModal = document.getElementById('confirm-delete-all-modal');
    const cancelDeleteAllBtn = document.getElementById('cancel-delete-all-btn');
    const confirmDeleteAllBtn = document.getElementById('confirm-delete-all-btn');
    const deleteAllPhrase = document.getElementById('delete-all-phrase');
    const deleteAllInput = document.getElementById('delete-all-input');

    // Statystyki
    const statLastUpdate = document.querySelector('#stat-last-update span');
    const statTotal = document.querySelector('#stat-total span');
    const statProjects = document.querySelector('#stat-projects span');
    const statFarms = document.querySelector('#stat-farms span');
    const statStatusProjects = document.getElementById('stat-status-projects');
    const statStatusFarms = document.getElementById('stat-status-farms');

    // --- STAN APLIKACJI ---
    let items = JSON.parse(localStorage.getItem('mineListItems')) || [];
    let lastUpdate = localStorage.getItem('mineListLastUpdate') || 'Nigdy';
    let itemToDeleteId = null;

    // --- DEFINICJE STANÓW ---
    const statuses = {
        common: [
            'Nie wybudowano jeszcze',
            'Szukanie miejsca',
            'W trakcie budowy',
            'Zbudowano',
            'Do przebudowy',
            'Do zmiany miejsca',
            'Do ulepszenia'
        ],
        farma: [
            'Szukanie sposobu',
            'Zepsuła się'
        ]
    };

    // --- LOGIKA BIZNESOWA I RENDEROWANIE ---

    const saveToLocalStorage = () => {
        const now = new Date();
        lastUpdate = now.toLocaleString('pl-PL');
        localStorage.setItem('mineListItems', JSON.stringify(items));
        localStorage.setItem('mineListLastUpdate', lastUpdate);
        updateStats();
    };

    const renderItems = () => {
        const projects = items.filter(item => item.type === 'projekt');
        const farms = items.filter(item => item.type === 'farma');
        
        renderList(projects, projectList, emptyProjectListMessage);
        renderList(farms, farmList, emptyFarmListMessage);
        
        updateStats();
    };

    const renderList = (itemListData, listElement, emptyMessageElement) => {
        listElement.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        // Filtrowanie
        const filteredItems = itemListData.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.status.toLowerCase().includes(searchTerm)
        );

        // Sortowanie
        let sortedItems = [...filteredItems];
        switch (sortBy) {
            case 'newest':
                sortedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'last-edited':
                 sortedItems.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'oldest':
                sortedItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'alphabetical':
                sortedItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        // Renderowanie
        if (sortedItems.length === 0) {
            emptyMessageElement.style.display = 'block';
        } else {
            emptyMessageElement.style.display = 'none';
            sortedItems.forEach(item => {
                const itemElement = document.createElement('article');
                itemElement.className = 'item-card';
                itemElement.dataset.id = item.id;
                
                // Tworzenie klasy CSS ze statusu
                const statusClass = 'status-' + item.status.toLowerCase().replace(/ /g, '-').replace(/ł/g, 'l').replace(/ż/g, 'z').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ć/g, 'c').replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z');

                itemElement.innerHTML = `
                    <div class="card-header">
                        <h3>${item.name}</h3>
                        <div class="card-actions">
                             <button class="edit-btn" title="Edytuj">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2H7a2 2 0 0 0 2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="delete-btn" title="Usuń">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                    <div class="card-meta">
                        <span class="item-type-badge ${item.type}">${item.type}</span>
                        <span class="item-status ${statusClass}">${item.status}</span>
                    </div>
                    <div class="card-content">
                        ${item.description ? `<p><strong>Opis:</strong> ${item.description}</p>` : ''}
                        ${item.comment ? `<p><strong>Komentarz:</strong> ${item.comment}</p>` : ''}
                    </div>
                    <div class="card-footer">
                        <small>Edytowano: ${new Date(item.updatedAt).toLocaleDateString('pl-PL')}</small>
                    </div>
                `;
                listElement.appendChild(itemElement);
            });
        }
    };
    
    const updateStats = () => {
        statLastUpdate.textContent = lastUpdate;
        statTotal.textContent = items.length;

        const projects = items.filter(item => item.type === 'projekt');
        const farms = items.filter(item => item.type === 'farma');

        statProjects.textContent = projects.length;
        statFarms.textContent = farms.length;
        
        const generateStatusHTML = (itemList, title) => {
            const statusCounts = itemList.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            }, {});

            if (Object.keys(statusCounts).length === 0) {
                return `<strong>${title}:</strong> <span>Brak</span>`;
            }
            
            let listHTML = `<strong>${title}:</strong><ul>`;
            for(const [status, count] of Object.entries(statusCounts)) {
                listHTML += `<li>${status}: ${count}</li>`;
            }
            listHTML += '</ul>';
            return listHTML;
        };
        
        statStatusProjects.innerHTML = generateStatusHTML(projects, 'Status projektów');
        statStatusFarms.innerHTML = generateStatusHTML(farms, 'Status farm');
    };

    // --- OBSŁUGA MODALI ---
    const openModal = (modal) => {
        modal.classList.add('visible');
    };

    const closeModal = (modal) => {
        modal.classList.remove('visible');
    };

    const populateStatusOptions = (type, selectedStatus = '') => {
        let options = [...statuses.common];
        if (type === 'farma') {
            options.push(...statuses.farma);
        }
        itemStatusSelect.innerHTML = options.map(status =>
            `<option value="${status}" ${status === selectedStatus ? 'selected' : ''}>${status}</option>`
        ).join('');
    };

    const openFormModal = (item = null) => {
        itemForm.reset();
        if (item) {
            modalTitle.textContent = 'Edytuj element';
            itemIdInput.value = item.id;
            itemTypeSelect.value = item.type;
            itemNameInput.value = item.name;
            itemForm['item-description'].value = item.description;
            itemForm['item-comment'].value = item.comment;
            populateStatusOptions(item.type, item.status);
        } else {
            modalTitle.textContent = 'Dodaj nowy element';
            itemIdInput.value = '';
            populateStatusOptions(itemTypeSelect.value);
        }
        openModal(formModal);
    };

    // --- OBSŁUGA ZDARZEŃ ---
    addNewBtn.addEventListener('click', () => openFormModal());

    itemTypeSelect.addEventListener('change', () => {
        populateStatusOptions(itemTypeSelect.value);
    });

    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = itemIdInput.value;
        const now = new Date().toISOString();
        
        const newItemData = {
            type: itemTypeSelect.value,
            name: itemNameInput.value.trim(),
            status: itemStatusSelect.value,
            description: itemForm['item-description'].value.trim(),
            comment: itemForm['item-comment'].value.trim(),
            updatedAt: now,
        };

        if (id) { // Edycja
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...newItemData };
            }
        } else { // Dodawanie
            items.push({
                ...newItemData,
                id: `id_${Date.now()}`,
                createdAt: now,
            });
        }
        
        saveToLocalStorage();
        renderItems();
        closeModal(formModal);
    });

    cancelBtn.addEventListener('click', () => closeModal(formModal));
    
    // Delegacja zdarzeń dla przycisków edycji i usuwania
    document.getElementById('project-list').addEventListener('click', handleCardActions);
    document.getElementById('farm-list').addEventListener('click', handleCardActions);

    function handleCardActions(e) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const card = editBtn.closest('.item-card');
            const item = items.find(i => i.id === card.dataset.id);
            if (item) {
                openFormModal(item);
            }
        }

        if (deleteBtn) {
            const card = deleteBtn.closest('.item-card');
            itemToDeleteId = card.dataset.id;
            const item = items.find(i => i.id === itemToDeleteId);
            deleteMessage.textContent = `Czy na pewno chcesz usunąć "${item.name}"?`;
            openModal(confirmDeleteModal);
        }
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if(itemToDeleteId) {
            items = items.filter(item => item.id !== itemToDeleteId);
            itemToDeleteId = null;
            saveToLocalStorage();
            renderItems();
            closeModal(confirmDeleteModal);
        }
    });
    
    cancelDeleteBtn.addEventListener('click', () => closeModal(confirmDeleteModal));

    // Usuwanie wszystkiego
    deleteAllBtn.addEventListener('click', () => {
        deleteAllInput.value = '';
        confirmDeleteAllBtn.disabled = true;
        openModal(confirmDeleteAllModal);
    });

    deleteAllInput.addEventListener('input', () => {
        confirmDeleteAllBtn.disabled = deleteAllInput.value.trim().toLowerCase() !== deleteAllPhrase.textContent;
    });

    confirmDeleteAllBtn.addEventListener('click', () => {
        items = [];
        saveToLocalStorage();
        renderItems();
        closeModal(confirmDeleteAllModal);
    });

    cancelDeleteAllBtn.addEventListener('click', () => closeModal(confirmDeleteAllModal));


    // Zamykanie modali
    [formModal, confirmDeleteModal, confirmDeleteAllModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.close-modal-btn')) {
                closeModal(modal);
            }
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(formModal);
            closeModal(confirmDeleteModal);
            closeModal(confirmDeleteAllModal);
        }
    });

    // Wyszukiwanie i sortowanie
    searchInput.addEventListener('input', renderItems);
    sortSelect.addEventListener('change', renderItems);

    // --- LOGIKA MOTYWÓW ---
    const themeButtons = {
        system: document.getElementById('theme-system'),
        light: document.getElementById('theme-light'),
        dark: document.getElementById('theme-dark')
    };
    
    const applyTheme = (theme) => {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('mineListTheme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.dataset.theme = systemPrefersDark ? 'dark' : 'light';
        } else {
            document.documentElement.dataset.theme = theme;
            localStorage.setItem('mineListTheme', theme);
        }

        Object.values(themeButtons).forEach(btn => btn.classList.remove('active'));
        themeButtons[theme].classList.add('active');
    };

    Object.entries(themeButtons).forEach(([themeName, button]) => {
        button.addEventListener('click', () => applyTheme(themeName));
    });
    
    // Listener dla zmiany motywu systemowego
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('mineListTheme') || localStorage.getItem('mineListTheme') === 'system') {
            applyTheme('system');
        }
    });

    // --- INICJALIZACJA ---
    const savedTheme = localStorage.getItem('mineListTheme') || 'system';
    applyTheme(savedTheme);
    renderItems();
});
