const helpers = {

    removeAllSectionTabsFromDOM: function() {
        let allTabs = document.getElementById('all-tabs');
        if (allTabs === null) return
        while(allTabs.lastChild) {
            allTabs.removeChild(allTabs.lastChild);
        }
    },

    displayFlashMsg: function(msg) {
        let flashMsgDiv = document.getElementById('flash-msg');
        flashMsgDiv.innerHTML = msg;
        flashMsgDiv.style.display = 'block';
    }

}