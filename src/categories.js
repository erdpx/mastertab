function handleAndInitializeCategories() {

    (function displayCategoriesInHeader() {
        storage.getObject('categories')
        .then(result => {
            result.categories.slice(1).forEach((category, i) => {
                categoriesHandlers.addCategoryToDOM(category);
            });
        })
        .catch(resultIsEmpty => {return});
    })();
    
    (function addNewCategoryEvents() {
    
        const newCategoryInput = document.getElementById('new-category-input');
        const newCategoryBtn = document.getElementById('new-category-btn');
    
        newCategoryInput.parentNode.addEventListener('click', () => {
            newCategoryInput.focus();
        });
    
        newCategoryInput.addEventListener('focus', () => {
            newCategoryBtn.style.display = 'initial';
        });
    
        newCategoryInput.addEventListener('focusout', () => {
            if (newCategoryInput.value == "") newCategoryBtn.style.display = 'none';
        });
    
        newCategoryInput.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 && newCategoryInput.value != "" && newCategoryInput.value.length <= 45)
                categoriesHandlers.addNewCategory(newCategoryInput.value);
        });
    
        newCategoryBtn.addEventListener('click', () => {
            if (newCategoryInput.value != "" && newCategoryInput.value.length <= 45)
                categoriesHandlers.addNewCategory(newCategoryInput.value);
        });
    })();

}

const categoriesHandlers = {

    addNewCategory: function(category) {
        storage.addNewCategory(category);
        this.addCategoryToDOM(category);
        this.addCategoryToSectionMenus(category);
        document.getElementById('new-category-input').value = "";
        document.getElementById('new-category-btn').style.display = 'none';
    },

    addCategoryToDOM: function(category) {
        const headerMenu = document.getElementById('header-menu').querySelector('ul');
        const headerMenuLi = document.getElementById('header-menu').querySelector('#new-category-input').parentNode;

        let newCategory = document.createElement('li');
        newCategory.classList.add('header-category');

        let newCategoryBtn = document.createElement('button');
        newCategoryBtn.innerHTML = category;

        // i+1 is the index of category in storage
        let categoriesLength = document.querySelectorAll('.header-category').length + 1;

        newCategory.addEventListener('click', () => {
            categoriesHandlers.displayTabsFromCategory(categoriesLength);
        });

        newCategory.appendChild(newCategoryBtn);
        headerMenu.insertBefore(newCategory, headerMenuLi);

        return newCategory;
    },
    
    addCategoryToSectionMenus: function(category) {
        let selectCategoryMenus = document.querySelectorAll('.section-category-menu-categories');
    
        if (selectCategoryMenus.length === 0) return;
    
        let categoriesLength = selectCategoryMenus[0].childNodes.length;
    
        selectCategoryMenus.forEach((categoriesMenu) => {
            // Get sectionId of menu in id of the ul with class tabs
            let categoryMenuSectionId = categoriesMenu.parentNode.parentNode.parentNode.id;
    
            let selectCategoryBtn = categoriesMenu.previousSibling;
    
            let option = this.createCategoryOption(category, categoriesLength, categoryMenuSectionId, 
                                                   selectCategoryBtn, categoriesMenu);

            categoriesMenu.insertBefore(option, categoriesMenu.lastChild);
        });
    },
    
    displayTabsFromCategory: function(category) {
        storage.getObject('tabs')
        .then(result => {
            helpers.removeAllSectionTabsFromDOM();
            result.tabs.forEach(tabs => {
                if (tabs[0] !== undefined && tabs[0].category === category) {
                    tabsHandlers.createSectionOfTabs(tabs);
                }
            });
        })
        .catch(resultIsEmpty => {return});
    },

    createSectionSelectCategoryMenu: function(sectionId, sectionCategoryBtn) {
        let selectCategoryMenu = document.createElement('ul');
    
        storage.getObject('categories')
        .then(result => {
    
            // Slice the first element because it will always be undefined, meaning 'No Category'
            result.categories.slice(1).forEach((category, i) => {
                let option = this.createCategoryOption(category, i+1, sectionId, sectionCategoryBtn, selectCategoryMenu);
                selectCategoryMenu.appendChild(option);
            });
    
            let defaultOption = this.createDefaultOption(sectionId, sectionCategoryBtn, selectCategoryMenu);
            selectCategoryMenu.appendChild(defaultOption);
        })
        .catch(resultIsEmpty => {

            let option = this.createCategoryOption("You don't have any category. Click here to create your first one!", 
                                                        0, sectionId, sectionCategoryBtn, selectCategoryMenu);

                selectCategoryMenu.appendChild(option);

                let _this = this;

                let observer = new MutationObserver(function(mutationElement) {
                    if (mutationElement[0].addedNodes) {
                        option.remove();
                        observer.disconnect();

                        let defaultOption = _this.createDefaultOption(sectionId, sectionCategoryBtn, selectCategoryMenu);
                        selectCategoryMenu.appendChild(defaultOption);
                    }
                });

                observer.observe(selectCategoryMenu, {childList: true, subtree: true});

                option.addEventListener('click', () => {
                    document.getElementById('new-category-input').focus();
                });

                return
        });

        return selectCategoryMenu;
    },

    createDefaultOption: function(sectionId, sectionCategoryBtn, selectCategoryMenu) {
        return this.createCategoryOption('No Category!', 0, sectionId, sectionCategoryBtn, selectCategoryMenu);
    },

    createCategoryOption: function(category, categoryId, sectionId, sectionCategoryBtn, selectCategoryMenu) {
        let option = document.createElement('li');
        let btn = document.createElement('button');
        btn.innerHTML = category;
        btn.value = categoryId;
        btn.addEventListener('click', () => {
            if (sectionId >= 0 && categoryId >= 0) {
                storage.addSectionCategory(sectionId, categoryId);
                sectionCategoryBtn.innerHTML = category;
            }
        });
        
        option.addEventListener('click', () => {
            selectCategoryMenu.style.display = 'none';
        });

        option.appendChild(btn);
    
        return option;
    },

    setSectionCategoryName: function(categoryValue, sectionCategory) {
        storage.getObject('categories')
        .then(result => {
    
            if (result.categories[categoryValue])
                sectionCategory.innerHTML = result.categories[categoryValue];
    
        })
        .catch(resultIsEmpty => sectionCategory.innerHTML = 'Select section category');
    },
}