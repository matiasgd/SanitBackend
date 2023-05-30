# SanitBackend

Para la iniciacion del proyecto se requiere seguir los siguientes pasos:

 ######  1. Realizar un npm i o npm install para instalar las dependencias del package.json
 ######  2. Se deberán crear una cuenta en Mongo Atlas:
   [Link Mongo Atlas ]( https://www.mongodb.com/cloud/atlas/register?utm_content=rlsapostreg&utm_source=google&utm_campaign=search_gs_pl_evergreen_atlas_general_retarget-brand-postreg_gic-null_amers-all_ps-all_desktop_eng_lead&utm_term=&utm_medium=cpc_paid_search&utm_ad=&utm_ad_campaign_id=14412646452&adgroup=131761126052&cq_cmp=14412646452&gclid=CjwKCAjw5pShBhB_EiwAvmnNV4I7WtNbhBGkGryY2sm14AOSgvc7swFRV4UKkLcAsK6mXcGca81oihoCT2UQAvD_BwE "Link Mongo Atlas ")

 ###### 3. Deberán solicitar al equipo de desarrollo el acceso a la DB del proyecto Sanit.
    El equipo de desarrollo les brindara:
    - [1]Usuario de ingreso
    - [2]Password
    - [3]Tambien se les pedira la IP para configurar los permisos de editar/modificar la DB.

 ###### 4. Dentro del repositorio en el root, crear un archivo .env donde deben incluirse las siguientes definiciones:

**PORT**=[Poner el puerto donde se va a levantar el proyecto del back. Por ejemplo: 3001]

**MONGO_URI**=mongodb+srv://[Usuario de ingreso [paso 3 [1]]]:[Password paso 3 [2]]@sanitcluster.wjjm3la.mongodb.net/

**CORS_ORIGIN**=[Poner el puerto donde van a levantar el proyecto desde el lado del Front. Por ejemplo:http://localhost:3000]


* **RECUERDE:** Reemplace la informacion entre [] por la informacion otorgada / solicitada.

###### 5. Para correr este proyecto correr el comando: npm start

[Haz click para obtener el repositorio del Front-end]([...] "Haz click para obtener el repositorio del Front-end")


### Desarrolladores 
* Javier Lema
* Matias Dominguez
* Francisco García
* Luciano Chiarelli
