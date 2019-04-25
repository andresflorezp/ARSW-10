# Laboratorio 10 Escalamiento con balanceo de carga

## Empezando

>Para clonar el archivo 

git clone https://github.com/andresflorezp/ARSW-LAB10.git
>
### Prerrequisitos
* Maven
* Java
* Git
* Maquinas Virtuales 
* Servicio Active MQ (Message Broker)
* Servicio nginx (Balanceador de carga)
* CloudAMPQ (Balanceador de carga en la nube)


### Instalación

Despues de clonar el archivo para correrlo con:

* mvn package "Esto te genera el JAR"

## Construido con

* [Maven](https://maven.apache.org/) - Gestión de dependencias

## Resolucion del laboratorio
### Parte 1

1) En uno de los dos servidores virtuales, inicie el servidor ActiveMQ. Para esto, ubíquese en el directorio apache-activemq-5.14.1/bin (en el directorio raíz del usuario 'ubuntu'), y ejecute ./activemq start .
2) Para verificar que el servidor de mensajes esté arriba, abra la consola de administración de ActiveMQ: http://IP_SERVIDOR:8161/admin/ (usuario/contraseña: admin/admin) . Consulte qué tópicos han sido creados en el momento.
3) Recupere la última versión del ejericio realizado de WebSockets (creación colaborativa de polígonos). Modifíquelo para que en lugar de usar el 'simpleBroker' (un broker de mensajes embebido en la aplicación), delegue el manejo de los eventos a un servidor de mensajería dedicado (en este caso, ActiveMQ).


#### Corriendo el Activemq

![Active mq](https://user-images.githubusercontent.com/23700749/56735893-542d7d00-672c-11e9-9f2b-a13235078cfe.PNG)

9) Al haber usado la aplicación, consulte nuevamente la consola Web de ActiveMQ, y revise qué información de tópicos se ha mostrado.
#### Despues de haber ejecutado el servicio de web sockets

![Topics in active mq](https://user-images.githubusercontent.com/23700749/56736063-cf8f2e80-672c-11e9-870c-cc8bda495b92.PNG)

### Parte 2

1) Escoja uno de sus dos servidores como responsable del balanceo de carga. En el que corresponda, cree un archivo de configuración para NGINX
Cree un archivo de configuración NGINX (por convención, use la extensión .conf), compatible con WebSockets, a partir de la siguiente plantilla. Ajuste la configuración de 'upstream' para que use el host y el puerto de los dos servidores virtuales, y el parámero 'listen' para que escuche en el puerto 8090 (o cualquier otro, siempre que sea diferente al usado por la aplicación que está en el mismo servidor).



## Codigo cambiado




events {

    worker_connections 768;
    # multi_accept on;
}

http {
 
    log_format formatWithUpstreamLogging '[$time_local] $remote_addr - $remote_user - $server_name to: $upstream_addr: $request';
 
    access_log   access.log formatWithUpstreamLogging;
    error_log    error.log;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    } 

    upstream simpleserver_backend {
    # default is round robin
        server 192.168.56.101:8080;
        server 192.168.56.102:8080;
    }
 
    server {
        listen 8090;
 
        location / {
            proxy_pass http://simpleserver_backend;
	    	proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

        }
    }
}

2) Desde un navegador, abra la URL de la aplicación, pero usando el puerto del balanceador de carga (8090). Verifique el funcionamiento de la aplicación.

### Corriendo el servicio

![corriendo el servicio de nginx](https://user-images.githubusercontent.com/23700749/56736141-02392700-672d-11e9-88cd-b3cf75e628d7.PNG)

3) Revise en la documentación de NGINX, cómo cambiar la estrategía por defecto del balanceador por la estrategia 'least_conn'.

### Nuevo Codigo

events {

    worker_connections 768;
    # multi_accept on;
}

http {
 
    log_format formatWithUpstreamLogging '[$time_local] $remote_addr - $remote_user - $server_name to: $upstream_addr: $request';
 
    access_log   access.log formatWithUpstreamLogging;
    error_log    error.log;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    } 

    upstream simpleserver_backend {
    least_conn
    # default is round robin
        server 192.168.56.101:8080;
        server 192.168.56.102:8080;
    }
 
    server {
        listen 8090;
 
        location / {
            proxy_pass http://simpleserver_backend;
	    	proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

        }
    }
}

3-4)Revise, a través de los LOGs de cada servidor, si se están distribuyendo las peticiones. Revise qué instancia de la aplicación se le está asignando a cada cliente.

### Mirando los logs corridos en chrome y firefox

![balanceo en chrome-mozilla](https://user-images.githubusercontent.com/23700749/56736169-1715ba80-672d-11e9-9e4a-50741a792863.PNG)


5) Apague una de las dos aplicaciones (Ctrl+C), y verifique qué pasa con el cliente que estaba trabajando con el servidor recién apagado.

![Al cerrar una app](https://user-images.githubusercontent.com/23700749/56736197-28f75d80-672d-11e9-93f2-238f5cf247bf.PNG)

6) Ajuste la aplicación para que la misma no tenga 'quemadas' datos como el host del servidor de mensajería o el puerto. Para esto revise la discusión hecha en StackOverflow al respecto.

![correr en conf d](https://user-images.githubusercontent.com/23700749/56736233-3dd3f100-672d-11e9-8dac-2e70c72a2d13.PNG)


## Parte 3

En su ejercicio, haga una rama llamada 'cloud-based-mom'. En ésta, configure su aplicación para que en lugar de usar el servidor JMeter, haga uso del servicio en RabbitMQ en la nube de CloudAMQP, el cual también es compatible con STOMP. Para esto:

1) Regístrese en la plataforma y cree una instancia gratuita (Lemur).


![Incio_lemur](https://user-images.githubusercontent.com/23700749/56738198-b937a180-6731-11e9-9e63-71e9bf1a53c4.PNG)

2) Abra la consola de configuración, y revise las credenciales de acceso.


![account_lemur](https://user-images.githubusercontent.com/23700749/56738179-af15a300-6731-11e9-8aa3-b686cd507d40.PNG)
3) Abra el siguiente ejemplo y revise cómo se configuró el 'relay-broker' para usar el servicio de mensajería de CloudAMQP.

### Codigo Cambiado
``` java
import java.util.logging.Logger;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class CollabPaintWebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        //config.enableSimpleBroker("/topic");
        config.enableStompBrokerRelay("/topic/").setRelayHost("clam.rmq.cloudamqp.com").setRelayPort(61613).
        setClientLogin("oeuoqwkw").
        setClientPasscode("psgY4_gYfss-xyAQmwWvg6tAlXIaXHJ_").
        setSystemLogin("oeuoqwkw").
        setSystemPasscode("psgY4_gYfss-xyAQmwWvg6tAlXIaXHJ_").
        setVirtualHost("oeuoqwkw");

        config.setApplicationDestinationPrefixes("/app");        
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //registry.addEndpoint("/stompendpoint").withSockJS();
        registry.addEndpoint("/stompendpoint").setAllowedOrigins("*").withSockJS();
    }
    

}

```

4) Ejecute la aplicación y revise su funcionamiento. Acceda a la consola de administración de CloudAMQP y revise qué efectivamente se estén creando los tópicos correspondientes.
5) Consulte 'benchmarks' comparativos entre RabbitMQ y ActiveMQ, y analice cual sería más conveniente.



## Autores

* **Andres Giovanne Florez Perez**  ARSW-LAB10 - [andresflorezp](https://github.com/andresflorezp)

* **Juan Nicolas Nontoa Caballero**  ARSW-LAB10 - [nontoa](https://github.com/nontoa)

Consulte también la lista de [colaboradores](https://github.com/andresflorezp/ARSW-LAB10/graphs/contributors) que participaron en este proyecto.

## licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.

