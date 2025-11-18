class PaginationManager{
    constructor(data, itemsPerPage){
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.data = data;

        this.itemsContainer = document.getElementById('items-container');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.pageInfo = document.getElementById('page-info');

        // Add 'this.' before prevBtn and nextBtn
        this.prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayItems(this.currentPage);
            }
        });

        this.nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(this.data.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayItems(this.currentPage);
            }
        });
    }


    displayItems(page) {
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const itemsToShow = this.data.slice(startIndex, endIndex);

        this.itemsContainer.innerHTML = ''; // Clear previous items
        itemsToShow.forEach(item => {
            const div = buildItemDisplay(item);
            this.itemsContainer.appendChild(div);
        });

        this.updatePaginationControls();
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.data.length / this.itemsPerPage);
        this.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;

        this.prevBtn.disabled = this.currentPage === 1;
        this.nextBtn.disabled = this.currentPage === totalPages;
    }
}