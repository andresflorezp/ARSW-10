
var app = (function () {
    var is_DRAW = false;
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        //console.log(point);      
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (lista) {
        //is_DRAW = false;
        var c2 = canvas.getContext('2d');
        c2.fillStyle = '#FF4136';
        c2.beginPath();
        c2.moveTo(lista[0].x, lista[0].y);
        for (var i = 1; i < lista.length; i++) {
            c2.lineTo(lista[i].x, lista[i].y);
        }
        c2.closePath();
        c2.fill();

    };



    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
    /*var isdraw = function () {
        is_DRAW = true;
        connectAndSubscribe($('#numero'));

    }*/
    var connectAndSubscribe = function (id) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                var npoint = JSON.parse(eventbody.body);
                //alert("Si funciono!!");
                addPointToCanvas(npoint);

            });
            stompClient.subscribe('/topic/newpolygon.' + id, function (eventbody) {
                var nlista = JSON.parse(eventbody.body);
                //alert("Si funciono!!");
                for (var i = 0; i < nlista.length; i++) {
                    for (var j = i + 1; j < nlista.length - 1; j++) {
                        if (nlista[j].x > nlista[j + 1].x) {
                            temp = nlista[j];
                            nlista[j] = nlista[j + 1];
                            nlista[j + 1] = temp;

                        }

                    }


                }
                //console.log(is_DRAW);
                //if (is_DRAW) {
                    //console.log(is_DRAW);
                addPolygonToCanvas(nlista);
                //}


            });
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");
            //console.log(canal);
            app.disconnect();

            /* if(canal!=""){
                 app.disconnect();
                 canal = id;
                 connectAndSubscribe(id);
             }
             else{
                 canal=id;
                 connectAndSubscribe(id);
             }    */
            id = $('#numero').val();
            connectAndSubscribe(id);

            can.addEventListener("click", function (evt) {
                var coord = getMousePosition(evt);
                let px = coord.x;
                let py = coord.y;
                var point = new Point(px, py);

                app.publishPoint(px, py, id);
            })
            //websocket connection

        },

        publishPoint: function (px, py, id) {
            var pt = new Point(px, py);
            //lista.push(pt);
            //console.info("publishing point at " + pt);
            //addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));
            stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt));


        },
        /*publishPolygon: function () {
            console.log("Si entro-------")
            isdraw();


        },*/

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            //setConnected(false);
            console.log("Disconnected");
        }
    };

})();