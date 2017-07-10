/*------------------------------------------------------------------------------------------------------------------------------
Script photoshop permettant d'exporter un JPG depuis un PSD avec la date du jour

Si le dossier JPG ou celui du prefixe n'existe pas, il seront créés
Si le fichiers comporte des compositions de calques, elles seront exportées en JPG séparés et nommées

Condition : le fichier photoshop doit être rangé dans un dossier "PSD" au préalable

Merci de ne pas redistribuer ce script directement, mais de linker la source

Conception : Julien Dubedout - judbd.com / www.mariejulien.com
Code /réalisation : Yannick Lepetit
------------------------------------------------------------------------------------------------------------------------------*/

var docActif = app.activeDocument;

//Vérification que le psd soit bien enregistré dans un dossier PSD
var reg = new RegExp("psd$" , "gi");
var uri_dossier_original = docActif.path;
var uri_dossier_racine = uri_dossier_original;
x=1;
while (reg.test(uri_dossier_racine) == false) {
    uri_dossier_racine = uri_dossier_racine.parent;
    x++;
    if ((x >= 10) || (uri_dossier_racine == null)) {
        //Si il n'y a pas de dossier PSD dans les 10 niveaux d'arbo précédents, on arrête le script, ça n'exportera rien.
        break;
    }
}

//Si le PSD est bien rangé dans un dossier PSD, on execute la fonction qui créée le dossier JPG et le sous dossier type
if (reg.test(uri_dossier_racine)) {
    uri_dossier_racine = uri_dossier_racine.parent;
    //crée une expression régulière pour détecter l'extension .psd en fin de nom du document actif, quelle que soit la casse
    var reg = new RegExp(".psd$" , "gi");
    //remplace la chaine ".psd" dans le nom du doc courant par une chaine vide, et sauve le tout dans la variable nom_doc
    var nom_doc = docActif.name.replace(reg , "");
    //choppe le chemin du document actif
    var uri_dossier_original = docActif.path;
    //défini une variable avec l'emplacement du dossier "JPG"
    var uri_dossier_jpg = uri_dossier_racine + "/JPG/";

    
    //créé un objet dossier à partir de l'adresse dossier jpg, puis créé le dossier si il n'existe pas
    var dossier_jpg = new Folder(uri_dossier_jpg);
    if (!dossier_jpg.exists) {
        dossier_jpg.create();
    }

        function saveJpgType(nom_doc) {
        // on met tout en minuscules
        nom_doc = nom_doc.toLowerCase();
        
        // on remplace les espaces et les caractères accentués
        nom_doc = nom_doc.replace(/^ /,"");
        nom_doc = nom_doc.replace(/ /gi,"_");
        nom_doc = nom_doc.replace(/['!?]/gi,"");
        nom_doc = nom_doc.replace(/_$/,"");
        nom_doc = nom_doc.replace(/[àâä]/gi,"a").replace(/[@]/gi,"-at-");
        nom_doc = nom_doc.replace(/[ç]/gi,"c");
        nom_doc = nom_doc.replace(/[éèêë]/gi,"e");
        nom_doc = nom_doc.replace(/[îï]/gi,"i");
        nom_doc = nom_doc.replace(/[ôö]/gi,"o");
        nom_doc = nom_doc.replace(/[ùûü]/gi,"u");

        //On récupère des éléments de dates pour les ajouter au nom de fichier
        //récupère la date en brut
        var date = new Date();
        //extrait l'année sur 4 chiffres
        var annee = date.getFullYear();
        //extrait le mois en brut, ou janvier = 0
        var mois = date.getMonth();
        //créé un tableau pour formater le chiffre du mois de manière correcte (janvier = 01)
        var mois_format = new Array("01","02","03","04","05","06","07","08","09","10","11","12");
        //extrait le jour du mois
        var jour = date.getDate();
        
        var jour_format = jour;
        //ajoute un "0" devant le chiffre du jour si celui-ci est inférieur à 10
        if (jour < 10) {
            jour_format = "0" + jour;
        }
        //concatene les variables pour donner le format de date souhaité pour nommer le dossier
        var date_format = annee + mois_format[mois] + jour_format;
        
        //enregistre le jpg avec le nom du doc sans son extension psd + extension JPG
        jpgFile = new File(uri_dossier_jpg + "/" + date_format + "_" + nom_doc + ".jpg");
        //créé un objet pour stocker les paramètres d'enregistrement
        jpgSaveOptions = new JPEGSaveOptions();
        //lie le profil de couleur (non)
        jpgSaveOptions.embedColorProfile = false;
        jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
        jpgSaveOptions.matte = MatteType.NONE;
        //qualité de l'export
        jpgSaveOptions.quality = 9;
        //sauve le document actif avec les paramètres ci dessus
        docActif.saveAs(jpgFile, jpgSaveOptions, true, Extension.LOWERCASE);
    }
   //vérifie l'existence de compo de calque, et si elles existent, les applique une à une avant de faire un enregistrement JPG de chaque
    var compsExist = docActif.layerComps;
        if(compsExist.length <= 0) {
            saveJpgType(nom_doc);
        }
        else {
            for(c=0; c<compsExist.length; c++) {
                compsExist[c].apply();
                saveJpgType(nom_doc+'_'+'comp'+'_'+compsExist[c].name);
            }
        }
    //reviens en arrière dans l'historique pour éviter les conflits de compos
    docActif.activeHistoryState = docActif.historyStates[docActif.historyStates.length-compsExist.length];  
}
