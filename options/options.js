const handleOptions = () => {

    (function handleResetTabs() {
        document.getElementById('reset-tabs').addEventListener('click', function(){
            chrome.storage.local.remove(['tabs'], () => {
                return helpers.displayFlashMsg('Seems like tabs were successfully removed!');
            });
        });
    })();

    (function handleResetCategories() {
        document.getElementById('reset-categories').addEventListener('click', function(){
    
            storage.getObject('categories')
            .then(result => {
                result.tabs.forEach((tabs) => {
                    tabs[0].category = undefined;
                });
               storage.setObject({'tabs': result.tabs});
            })
            .catch(resultIsEmpty => {return});;

            chrome.storage.local.remove(['categories'], () => {
                document.getElementById('categories-name').remove();
                helpers.displayFlashMsg('Seems like categories were successfully removed!');
            });
        })
    })();

    (function handleCategoriesOptions() {
        let categoriesNameUl = document.getElementById('categories-name');
        storage.getObject('categories')
        .then(result => {
    
            // result.categories[0] == null, meaning 'No category', hence, slice(1)
            result.categories.slice(1).forEach((category, i) => {
    
                let inputLi = document.createElement('li');
                let input = document.createElement('input');
    
                inputLi.value = i + 1;
                input.value = category;
    
                let changeCategoryNameBtn = document.createElement('button');
                changeCategoryNameBtn.innerHTML = 'Change Category Name!';
    
                changeCategoryNameBtn.addEventListener('click', () => {
                    if (category == input.value)
                        return input.focus();

                    if (input.value !== '')
                        return changeCategoryInStorage(inputLi.value, input.value, category);
                });
    
                let deleteCategoryBtn = document.createElement('button');
                deleteCategoryBtn.innerHTML = 'Delete Category!';
    
                deleteCategoryBtn.addEventListener('click', () => {
                    if (!inputLi.value) return
                    return deleteCategoryFromStorage(inputLi.value, category, inputLi);
                });
    
                utils.appendChildren(inputLi, [input, changeCategoryNameBtn, deleteCategoryBtn]);
                categoriesNameUl.appendChild(inputLi);
            });
        })
        .catch(resultIsEmpty => {return});
    })();
    

    function changeCategoryInStorage(categoryId, categoryName, oldCategory) {
        storage.changeCategoryName(categoryId, categoryName);
            helpers.displayFlashMsg('Seems like ' + oldCategory + ' was successfully changed to ' + categoryName + '!');
    }

    function deleteCategoryFromStorage(categoryId, categoryName, inputLi) {
        storage.deleteCategory(categoryId);
        helpers.displayFlashMsg('Seems like ' + categoryName + ' was successfully removed!');
        inputLi.remove()
    }
}