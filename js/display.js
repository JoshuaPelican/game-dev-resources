function buildItemDisplay(item){
    const div = document.createElement('div');


    div.classList.add("item-card");

    const customData = JSON.parse(item.CustomData);

    if(!item.Favicon){
        item.Favicon = customData.Link ? 
            `<img src="https://www.google.com/s2/favicons?sz=24&domain=${encodeURIComponent(customData.Link)}" alt="favicon">` : '';
    }

    div.innerHTML = 
    `
    <a href="${customData.Link}">
    <div class="item-header">
        ${item.Favicon}
        <p><b>${item.DisplayName}</b></p>
    </div>    
    </a>  
    <div class="item-body">
        <div class="item-info">
            <p>${customData.Licensing}</p>
            <div>* * * * *</div>
        </div>
        <p class="item-desc">${item.Description}</p>
    </div>
    <div class="item-footer">
        <img src="" alt=" ">
        <div class="item-tag-container"><p>${item.Tags.join(", ")}</p></div>
    </div>
    `
    return div;
}