## UNIVERSIDAD NACIONAL

## SEDE REGIONAL BRUNCA

```
EIF 411 Desarrollo y diseño de plataformas móviles
Profesor: Daniel Granados Murillo
```
(^)
**Actividad 3 : API + Sincronización Fecha de entrega: 2 4 /0 4 /2026 11:59 pm
Objetivo**
En clase se ha visto el uso de la Camara de expo o la nativa de react-native, por ende, este
laboratorio pretende que el estudiante puede consumir el API de alguna IA con la cual
pueda identificar la planta, los cuidados y el resto de información que se ha definido,
además de esto, se debe publicar el API del backend en Render o algún otro cloud que le
permita gestionar este tipo de deploy.
Además, deberá identificar cuales módulos van a seguir funcionando sin internet y el por
qué, además de cómo van a repercutir en el uso de la App y en la experiencia del usuario.
Deberá investigar el mejor método de salvaguardado en local, que pueda adaptarse al
proyecto actual, debe existir una justificación del mismo, así como de la información que
quieren guardar y él porque es importante guardarla.
**Indicaciones generales**

1. Lea y comprenda cuidadosamente todo el documento antes de iniciar la actividad.
2. La actividad es de carácter individual.
3. El trabajo integra investigación, análisis, diseño y desarrollo; por lo tanto, todas las
    decisiones tomadas deben estar debidamente justificadas y reflejadas en el
    proyecto final.
4. El trabajo deberá entregarse en el AV, no se aceptarán trabajos por otros medios,
    además si el trabajo se entrega de forma tardía tendrá una nota de 0.


**Parte 1: Investigación y análisis**

- Deberá identificar cuáles son los módulos generales del App actualmente, definir
    cuáles van a poder usarse sin necesidad de internet, es decir, se sincronizarán los
    cambios cuando vuelva la conexión.
- Deberá justificar dichos módulos y el por qué son más importantes que otros.
- Deberá investigar cual es la mejor forma de mostrar mensajes o contenido en
    espera o que no se ha sincronizado, esto cuando no hay conexión.
- Identificar el mejor uso de almacenamiento local según el proyecto de cada uno.

**Parte 2: Desarrollo**

```
o Deberá desplegar la App en Render o algún host.
o Deberá poder tomar una foto de la planta e identificarla con IA.
o La App deberá seguir funcionando, aunque no se den permisos, claro que no
se pueda usar la cámara/dispositivo, además debe permitírsele al usuario
volver a solicitar los permisos.
o Mensajes o formas de mostrar al usuario que el contenido debe
sincronizarse.
```
**Parte 3: Entrega**

Un video del funcionamiento de la App, donde se rechazan los permisos, luego se intenta
usar la App, lo solicitan otra vez, toman una foto a la planta y la identifican usando IA,
además de guardarse en la base de datos.

Deberá entregar un documento en PDF donde se encuentre el análisis antes descrito, un
link al repo, además de un link al video. Además del link a render del Api compartida con el
correo granadosdaniel566@gmail.com o daniel.granados.dev.566@gmail.com


```
Rúbrica de evaluación
```
**Criterio Subcriterio Excelente Bueno Básico Deficiente Puntaje**

**1. Investigación
y Análisis ( 40
pts)**

```
Identificación de
módulos offline
```
```
Identifica módulos
correctamente con
justificación técnica sólida
```
```
Identifica módulos con
justificación parcial
```
```
Identificación
confusa
```
```
No identifica 10
```
```
Justificación de
prioridades
```
```
Justificación clara basada en
UX, negocio y uso
```
```
Justificación aceptable Justificación
débil
```
```
Sin
justificación
```
## 10

```
Almacenamiento
local
```
```
Se identifica cuales métodos
son los mejores y se justifica
el por qué
```
```
Se identifica, pero no se
justifica.
```
```
Identificación
limitada.
```
```
Sin
justificación
```
## 15

```
Estrategias UX sin
conexión
```
```
Propone soluciones
completas (loading, retry,
banners, etc.)
```
```
Soluciones básicas Propuesta
limitada
```
```
No investiga 5
```
**2. Desarrollo
Técnico ( 30 pts)**

```
Agregar una
planta
```
```
Se toma una foto de la planta,
se puede identificar y se
genera un feedback al usuario
de la veracidad de la
información
```
```
Se agrega una foto, pero
no se da feedback al
usuario, ni nada de
información relevante.
```
```
Incompleto No
implementa
```
## 25

```
Despliegue del
API
```
```
API desplegada
correctamente con logs
verificables
```
```
Funciona con detalles
menores
```
```
Problemas
importantes
```
```
No despliega 5
```
```
Documento PDF Claro, estructurado y con
análisis técnico sólido
```
```
Correcto pero
superficial
```
```
Incompleto No entrega 10
```

**3. Entrega y
Documentación
(20 pts)**

```
Repositorio Código limpio, organizado y
con README claro
```
```
Funcional pero
desordenado
```
```
Poco claro No entrega 5
```
```
Uso de
almacenamiento
identificado
```
```
Lista clara de pantallas o
modulos
```
```
Lista parcial Muy
incompleto
```
```
No incluye 5
```
**4. Video (10 pts) Demostración** Muestra el ingreso de la
    planta y el como se puede
    saber la veracidad de la
    información, da información
    sobre el prompt usando

```
Parcial Poco claro No entrega 10
```

