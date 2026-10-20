#Template Twig a HTML


##Configuración para las plantillas

Para iniciar el proyecto hay que ejecutar **npm install**, para descargar las dependencias de **Grunt.js**, después ejecutar grunt. Después ejecutar **composer install**.

El proyecto cuenta con los siguientes directorios:

* **App** (Contiene las clases PHP para el envío de correo)
* **assets** (Contiene los archivos Js, Css, imágenes, .htaccess, favicon y demás archivos de la carpeta public o web)
* **data** (Contiene un archivo **data.json** con las rutas y configuración del proyecto)
* **sass** (Archivos de SASS)
* **views** (Contiene las vistas y el layout Twig)

El archivo **.htaccess** se encarga de ocultar las extensiones **.html** y **.php** de los archivos para generar URLS amigables.

Para agregar los links se utiliza **{{ path['asesoria-section'] }}**, el valor de **path** hace referencia a un valor dentro del archivo **data.json**.

En el **data.json** hay una llave **config** que posee valores globales como

* Titulo
* Descripcion
* Idioma
* URL del sitio de produccion
* Etc



##Configuración para el envío de correo
En la carpeta App existen dos archivos el **config.php** que posee la configuración para el envío de correos y el **rules.php** que posee la validación de los campos de correo.

Para la validación se está utilizando la libreria PHP **valitron.php**
[Link del proyecto](https://github.com/vlucas/valitron).

Para el envío de correos se está utilizando la libreria **PHPMailer** [Link del proyecto](https://github.com/PHPMailer/PHPMailer)

Para el envío de correo debe mandarse el correo por **POST** a la url **sendmail** dentro del proyecto. El sendmail retornara una respuesta AJAX con dos valores **state** que tendrá un valor de "**ok**" o "**error**" y **message** que tendrá un mensaje de resultado.


#Links de la documentación del compilador TWIG
[Twig JS](http://showmethecode.es/php/twig/twig-js-plantillas-twig-en-el-lado-del-cliente/)

[Twig Grunt](https://github.com/stefanullinger/grunt-twig-render)

[Pagina de Twig](http://twig.sensiolabs.org/)
