(function () {
var hotspots ={
    "0":{
        "title": "Gancho para cable de winch",
        "img": "/img/content/hotspots/gancho-winch.jpg",
        "description": "Modelo UltraHook XTV de la marca Factor 5"
    },
    "1":{
        "title": "Estructura de winch",
        "img": "/img/content/hotspots/estructura-de-winch.jpg",
        "description": "Interna, diseñada dentro las dimensiones del bumper original, con anclajes atornillados a las puntas de chasis, recubierto de Rhino Linings"
    },
    "2":{
        "title": "Parrilla",
        "img": "/img/content/hotspots/parrila.jpg",
        "description": "Diseño especial Toyota\n"
    },
    "3":{
        "title": "Tapa de motor",
        "img": "/img/content/hotspots/tapa-motor.jpg",
        "description": "Diseñada a la medida, fabricada a mano en fibra de vidrio."
    },
    "4":{
        "title": "Silvines principales",
        "img": "/img/content/hotspots/silvines-principales.jpg",
        "description": "LED Originales Toyota"
    },
    "5":{
        "title": "Guardabarros delanteros",
        "img": "/img/content/hotspots/guardabarro-delantero.jpg",
        "description": "Extensiones del bumper delantero fabricadas en fibra de vidrio, hechas a mano. Aumento en el ancho de la carrocería original, 3.5'' a cada lado."
    },
    "6":{
        "title": "Aros",
        "img": "/img/content/hotspots/aros.jpg",
        "description": "Marca US Wheels. Beadlocks. Medida: 17''x 9''"
    },
    "7":{
        "title": "Suspensión delantera",
        "img": "/img/content/hotspots/suspension-delantera.jpg",
        "description": "2 coilovers Old Man Emu BP-51 ajustables con reservorio. Ganancia en altura: 3''"
    },
    "8":{
        "title": "Snorkels",
        "img": "/img/content/hotspots/snorkels.jpg",
        "description": "Dos snorkel recubiertos con Rhino Linings, uno a cada lado del vehículo. Fabricados a la medida en fibra de vidrio."
    },
    "9":{
        "title": "Polarizado",
        "img": "/img/content/hotspots/poralizado.jpg",
        "description": "Polarizado tipo limosina en los costados"
    },
    "10":{
        "title": "Estribos",
        "img": "/img/content/hotspots/estribos.jpg",
        "description": "Hechos a la medida con tubo de acero, recubiertos de Rhino Linings"
    },
    "11":{
        "title": "Accesorios adicionales",
        "img": "/img/content/hotspots/accesorios-adicionales.jpg",
        "description": "Pichingas para gasolina ancladas a la batea"
    },
    "12":{
        "title": "Batea",
        "img": "/img/content/hotspots/batea.jpg",
        "description": "Recubierta con Rhino Linings. Incluye dos pichingas con sus respectivas bases"
    },
    "13":{
        "title": "Bumper trasero",
        "img": "/img/content/hotspots/bumper-trasero.jpg",
        "description": "ARB Summit"
    },
    "14":{
        "title": "Winch",
        "img": "/img/content/hotspots/winch.jpg",
        "description": "Warn XP9.500 con cable sintético y gancho UltraHook XTV de la marca Factor 55. La estructura del winch es interna, diseñada dentro de las dimensiones del bumper original, con anclajes atornillados a las puntas de chasis, recubierto de Rhino Linings"
    },
    "15":{
        "title": "Leds",
        "img": "/img/content/hotspots/luces_adicionales.jpg",
        "description": "Barra LED de 13'' en la parte delantera, barra LED de 31,5'' en el techo, halógenos ARB Intensity 21LED."
    },
    "16":{
        "title": "Extensiones de guardabarro trasero",
        "img": "/img/content/hotspots/extension-guardabarro.jpg",
        "description": "Fabricados a mano en fibra de vidrio, diseñados específicamente para el modelo de vehículo. Aumento en el ancho de la carrocería, 3.5''."
    },
    "17":{
        "title": "Llantas",
        "img": "/img/content/hotspots/llantas.jpg",
        "description": "Raceline wheels competition beadlock rock 8. medida: 17''x 9''"
    },
    "18":{
        "title": "Porta repuesto en el cajón",
        "img": "/img/content/hotspots/porta-repuesto-cajon.jpg",
        "description": "Diseñado a la medida en acero, recubierto de Rhino Linings."
    },
    "19":{
        "title": "Cobertor de compuerta",
        "img": "/img/content/hotspots/cobertor-compuerta.jpg",
        "description": "En fibra de vidrio, hecho a mano y diseñado específicamente para el vehículo"
    },
    "20":{
        "title": "Planchas protectoras de la parte inferior del vehículo: ",
        "img": "/img/content/hotspots/planchas-protectoras.jpg",
        "description": "Juego de 4 planchas que cubren desde el motor hasta el transfer, marca ARB."
    },
    "21":{
        "title": "Color del vehículo",
        "img": "/img/content/hotspots/colores.jpg",
        "description": "6 colores llamativos a escoger"
    },
    "22":{
        "title": "Suspensión trasera",
        "img": "/img/content/hotspots/suspencion-trasera.jpg",
        "description": 'Compensadores BP-51 Old Man Emu ajustables con reservorio. Hojas de resorte, balancines engrasables, bushines de poliuretano y gasas Old Man Emu. Ganancia en altura: 2"'
    }
}

    $('.hotspot').on('click', function(){
        var elePosition = $(this).attr('data-dot');
        $('.modal').modal();
        $('.image-hotspot').attr('src', hotspots[elePosition].img);
        $('.image-hotspot').attr('alt', hotspots[elePosition].title);
        $('.title-info-hotspots').html(hotspots[elePosition].title);
        $('.description-info-hotspots').html(hotspots[elePosition].description);
    });

}());