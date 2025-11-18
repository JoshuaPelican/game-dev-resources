function buildItemDisplay(item){
    const div = document.createElement('div');
    div.textContent = item.DisplayName;
    return div;
}