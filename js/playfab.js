class PlayFabManager{
    constructor(titleID, onCatalogLoaded){
        this.titleID = titleID;
        this.catalog = [];
        this.onCatalogLoaded = onCatalogLoaded;
        this.initialize();
    }

    initialize(){
        PlayFab.settings.titleId = this.titleID;

        var loginRequest = {
            TitleId: PlayFab.settings.titleId,
            CustomId: "test-player",
            CreateAccount: true
        };

        PlayFabClientSDK.LoginWithCustomID(loginRequest, (result, error) => {
            this.loginCallback(result, error);
        });
    }

    loginCallback(result, error) {
        if (result !== null) {
            console.log("Login successful!");
            this.getCatalog();
        } else if (error !== null) {
            console.log("Login failed:", error);
            console.log("Error details:", PlayFab.GenerateErrorReport(error));
        }
    }

    getCatalog(){
        PlayFabClientSDK.GetCatalogItems(
            { CatalogVersion: "Master" },
            (result, error) => this.storeCatalog(result, error)
        );
    }

    storeCatalog(result, error){
        if (error) {
            console.log("Error getting catalog:", error);
            return;
        }
        
        this.catalog = result.data.Catalog;
        console.log("Catalog loaded!")
        
        if(this.onCatalogLoaded)
            this.onCatalogLoaded();
    }
}