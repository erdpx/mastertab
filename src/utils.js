const utils = {

    appendChildren: function(elem, children) {
        children.forEach((child) => {
            elem.appendChild(child);
        });
    },

    setAttributes: function(elem, attrs) {
        for (let attr in attrs) {
            elem.setAttribute(attr, attrs[attr]);
        }
    }
    
}