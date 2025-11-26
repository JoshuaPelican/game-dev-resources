class App{
    constructor(){
        this.playfab = new PlayFabManager("71E9B", () => this.initialize());
        this.pagination = new PaginationManager([], 12);

        this.loadingText = document.getElementById("loading");
    }

    initialize(){
        /*         
        Promise.any([getCsvFromGoogleSheet("https://docs.google.com/spreadsheets/d/e/2PACX-1vQlnrc8PQuawbbDLlPqoAuVbc80i8Dsr_CKl5wi-ZwHen4wmKY1lprujq90R4PMbTU75wnkpgS6xAdf/pub?output=csv")])
        .then((csv) =>{
            this.data = csvToJson(csv);
            this.pagination.displayItems(1);
        });
        */
        this.pagination.data = this.playfab.catalog;
        this.pagination.displayItems(1);
        this.loadingText.style.display = "none";
    }
}

new App();