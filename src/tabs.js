function handleAndInitializeTabs() {

    (function displayAllTabs() {
        storage.getObject('tabs')
        .then(result => {
            result.tabs.forEach((tabs) => {
                tabsHandlers.createSectionOfTabs(tabs);
            });
        })
        .catch(resultIsEmpty => {return});
    })();

    (function handleAllTabsButton() {
        let allTabsBtn = document.getElementById('select-all-tabs');
        allTabsBtn.addEventListener('click', () => {
            chrome.tabs.update({url: 'mastertab.html'});
        });
    })();
    
    (function handleHeaderAnchor() {
        document.getElementById('main-title').querySelector('a').addEventListener('click', () => {
            chrome.tabs.update({url: 'mastertab.html'});
        });
    })();

}

const tabsHandlers = {

    createSectionOfTabs: function(tabs, header = true) {
        // The first element will always be sectionId, hence, tabs.length <= 1
        if (!tabs[0] || tabs.length <= 1) return

        let sectionId = tabs[0].sectionId;

        let tabsSection = document.createElement('ul');
        tabsSection.className = 'tabsSection';

        let tabsListDiv = document.createElement('div');
        tabsListDiv.className = 'tabs';

        // Remove tabs tabsSection in DOM if it becomes empty
        let observer = new MutationObserver(function(mutationElements) {
            mutationElements.forEach(mutationElement => {
                if (mutationElement.removedNodes) {
                    if (tabsListDiv.children.length == 0) {
                        tabsSection.remove();
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(tabsListDiv, {childList: true, subtree: true});

        if (tabs[0].minimizeSection) tabsListDiv.style.display = 'none';

        if (header) tabsSection = this.createTabsSectionHeader(tabs, sectionId, tabsSection, tabsListDiv);

        // Create li element with the tab url, title, favicon and id along with their events
        tabs.slice(1).forEach((tab) => {

            let mt = new this.Tab(tab, sectionId, tabsSection);
            
            li = mt.createTabElement()
            
            tabsListDiv.appendChild(li);

        });

        tabsSection.appendChild(tabsListDiv);

        let allTabsDiv = document.getElementById('all-tabs');
        allTabsDiv.insertBefore(tabsSection, allTabsDiv.firstChild);

        return tabsSection;
    },

    createTabsSectionHeader: function(tabs, sectionId, tabsSection, tabsListDiv) {

        tabsSection.id = sectionId;

        let sectionOptionsHeader = document.createElement('div');
        sectionOptionsHeader.className = 'section-header-options';

        let minimizeSectionImg = document.createElement('img');
        minimizeSectionImg.classList.add('minimize-section');
        minimizeSectionImg.src = './img/minimizeBtn.svg';
        minimizeSectionImg.addEventListener('click', () => {
            storage.getObject('tabs')
            .then(result => {
                if (tabsListDiv.style.display == 'none') {
                    tabsListDiv.style.display = 'initial';
                    result.tabs[sectionId][0].minimizeSection = false;
                    
                } else {
                    tabsListDiv.style.display = 'none';
                    result.tabs[sectionId][0].minimizeSection = true;
                }

                storage.setObject({'tabs': result.tabs});
            })
            .catch(err => console.error('Could not minimize section.'));

        });

        let deleteSectionImg = document.createElement('img');
        deleteSectionImg.classList.add('delete-section');
        deleteSectionImg.src = './img/closeBtn.svg';
        deleteSectionImg.addEventListener('click', () => {
            storage.deleteSection(sectionId);
            tabsSection.remove();
        });

        let sectionCategoryMenu = document.createElement('div');
        sectionCategoryMenu.className = 'section-category-menu';

        let sectionCategoryBtn = document.createElement('button');
        sectionCategoryBtn.className = 'section-category-btn';
        sectionCategoryBtn.innerHTML = 'Select section category';
        sectionCategoryBtn.addEventListener('click', () => {

            if (sectionCategoryContent.style.display == 'initial')
                sectionCategoryContent.style.display = 'none'
            else
                sectionCategoryContent.style.display = 'initial';

        });

        let sectionCategoryContent = categoriesHandlers.createSectionSelectCategoryMenu(sectionId, sectionCategoryBtn);
        sectionCategoryContent.className = 'section-category-menu-categories';

        categoriesHandlers.setSectionCategoryName(tabs[0].category, sectionCategoryBtn);
        
        utils.appendChildren(sectionCategoryMenu, [sectionCategoryBtn, sectionCategoryContent]);
        utils.appendChildren(sectionOptionsHeader, [minimizeSectionImg, deleteSectionImg, sectionCategoryMenu]);
        tabsSection.appendChild(sectionOptionsHeader);

        return tabsSection
    },

    Tab: function(tab, sectionId, tabSection) {
        this.tab = tab;
        this.sectionId = sectionId;
        this.li = null; // defined at createTabElement()
        this.tabSection = tabSection;
    
        this.createTabElement = function() {
            this.li = document.createElement('li');
            this.li.draggable = true;
            this.li.className = 'tab-li';
    
            this.li.id = this.tab.id;

            let a = document.createElement('a');
            a.innerHTML = tab.title;
            a.draggable = false;
            a.classList.add('tab-title');
            utils.setAttributes(a, {'href': tab.url, 'target': '_blank'});
    
            let favicon = this.tab.favicon;
            let faviconImg = document.createElement('img');
            faviconImg.setAttribute('src', favicon);
            faviconImg.onerror = () => {
                faviconImg.src = './img/mt48.png';
            }
    
            let deleteBtnImg = document.createElement('img');
            deleteBtnImg.src = './img/closeBtn.svg';

            this.li.addEventListener('click', (e) => {
                if(e.target !== deleteBtnImg && e.target !== a)
                    a.click();
            });

            this.li.addEventListener('keydown', (e) => {
            });

            let tabOptionsDiv = document.createElement('div');
            tabOptionsDiv.classList.add('tab-options');

            utils.appendChildren(this.li, [deleteBtnImg, faviconImg, a]);
    
            this.addMouseEventToDeleteTab();
    
            this.handleDragAndDrop()
    
            return this.li
        }
    
        this.handleDragAndDrop = function(li) {
            li = li || this.li;
            li.addEventListener('dragstart', this.dragStart);
            li.addEventListener('dragover', this.dragOver);
            li.addEventListener('dragleave', this.dragLeave);
            let _this = this;
            li.addEventListener('drop', function(event) {
                _this.dragDrop(event, this) // _this == MasterTab && this == event this

            });
        }
    
        this.dragStart = function(event) {
            // Set the style of delete-tab image to none as default
            this.firstChild.style.display = 'none';
            event.dataTransfer.setData('text/html', this.outerHTML);
            this.classList.add('draggedElement');
        }
        
        this.dragOver = function(event) {
            event.preventDefault();
            this.classList.add('over');
        }
    
        this.dragLeave = function() {
            this.classList.remove('over');
        }

        this.dragDrop = function(event, _this) {
            event.stopPropagation();
        
            _this.classList.remove('over');
    
            let currentDraggingElement = event.dataTransfer.getData('text/html');
            _this.insertAdjacentHTML('beforebegin', currentDraggingElement);
    
            this.addMouseEventToDeleteTab(_this.previousSibling, _this.parentNode.getAttribute('id')); // currentDraggingElement, sectionId
            this.handleDragAndDrop(_this.previousSibling);
    
            let draggedTab = document.querySelector('.draggedElement');
            let draggedTabId = draggedTab.getAttribute('id');
            let draggedTabSectionId = draggedTab.parentNode.parentNode.getAttribute('id');
        
            draggedTab.remove();
        
            let targetTabId = _this.getAttribute('id');
            let targetTabSectionId = _this.parentNode.parentNode.getAttribute('id');
    
            if (draggedTabSectionId != targetTabSectionId) {
                return storage.updateTabsFromTwoSections({id: draggedTabId, sectionId: draggedTabSectionId},
                                                         {id: targetTabId, sectionId: targetTabSectionId});
            }

            storage.updateTabs(draggedTabId, targetTabId, targetTabSectionId);
        }
    
        this.addMouseEventToDeleteTab = function(li, sectionId) {
            li = li || this.li;
            sectionId = sectionId || this.sectionId;
    
            let tabId = li.id;
            
            li.addEventListener('mouseover', () => {
                li.firstChild.style.display = 'initial';
            });
            li.addEventListener('mouseleave', () => {
                li.firstChild.style.display = 'none';
            });

            li.firstChild.addEventListener('click', () => {
                storage.deleteTab(sectionId, tabId);
                li.remove();
            });
        }
    }
}
