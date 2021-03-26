      // window.onload = init;
let togg1 = document.getElementById("togg1");
let togg2 = document.getElementById("togg2");
let d1 = document.getElementById("d1");
let d2 = document.getElementById("d2");
d1.style.display = "none";
d2.style.display = "block";
togg1.addEventListener("click", () => {
  if(getComputedStyle(d1).display != "none"&& getComputedStyle(d2).display != "none" ){
    d1.style.display = "none";
    d2.style.display = "block";
    
  } else {
    d1.style.display = "block";
    d2.style.display = "none";
    togg1.style.display = "none";
    //window.onload = init();   
  }
});

function ouvrir_camera() {

     navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 240 } }).then(function(mediaStream) {

      var video = document.getElementById('sourcevid');
      video.srcObject = mediaStream;

      var tracks = mediaStream.getTracks();

      document.getElementById("message").innerHTML="message: "+tracks[0].label+" connecté"

      console.log(tracks[0].label)
      console.log(mediaStream)

      video.onloadedmetadata = function(e) {
       video.play();
      };
       
     }).catch(function(err) { console.log(err.name + ": " + err.message);

     document.getElementById("message").innerHTML="message: connection refusé"});
    }

function photo(){

     var vivi = document.getElementById('sourcevid');
     //var canvas1 = document.createElement('canvas');
     var canvas1 = document.getElementById('cvs')
     var ctx =canvas1.getContext('2d');
     canvas1.height=vivi.videoHeight
     canvas1.width=vivi.videoWidth
     console.log(vivi.videoWidth)
     ctx.drawImage(vivi, 0,0, vivi.videoWidth, vivi.videoHeight);

     //var base64=canvas1.toDataURL("image/png"); //l'image au format base 64
     //document.getElementById('tar').value='';
     //document.getElementById('tar').value=base64;
     //return ctx;
    }

function sauver(){

     if(navigator.msSaveOrOpenBlob){

      var blobObject=document.getElementById("cvs").msToBlob()

      window.navigator.msSaveOrOpenBlob(blobObject, "image.png");
     }

     else{

      var canvas = document.getElementById("cvs");
      var elem = document.createElement('a');
      elem.href = canvas.toDataURL("image/png");
      elem.download = "nom.png";
      var evt = new MouseEvent("click", { bubbles: true,cancelable: true,view: window,});
      elem.dispatchEvent(evt);

     }
     return elem;
    }

function prepare_envoi(){

     var canvas = document.getElementById('cvs');
     canvas.toBlob(function(blob){envoi(blob)}, 'image/jpeg');
    }
    
    
function envoi(blob){

     console.log(blob.type)

     var formImage = new FormData();
     formImage.append('image_a', blob, 'image_a.jpg');

     var ajax = new XMLHttpRequest();

     ajax.open("POST","./script.js",true);
     //ajax.open("POST","http://scriptevol.free.fr/contenu/reception/upload_camera.php",true);

     ajax.onreadystatechange=function(){

      if (ajax.readyState == 4 && ajax.status==200){

       document.getElementById("jaxa").innerHTML+=(ajax.responseText);
      }
     }

     ajax.onerror=function(){

      alert("la requette a échoué")
     }

     ajax.send(formImage);
     console.log("ok")
    }

    
function fermer(){

     var video = document.getElementById('sourcevid');
     var mediaStream=video.srcObject;
     console.log(mediaStream)
     var tracks = mediaStream.getTracks();
     console.log(tracks[0])
     tracks.forEach(function(track) {
      track.stop();
      document.getElementById("message").innerHTML="message: "+tracks[0].label+" déconnecté"
     });

     video.srcObject = null;
    }

let model;
let class_indices;
let fileUpload = document.getElementById('uploadImage');
let fileUpload1 = document.getElementById('uploadImage1');
let fileUpload2 = document.getElementById('uploadImage2');

let img = document.getElementById('image');
let boxResult = document.querySelector('.box-result');
let confidence = document.querySelector('.confidence');
let pconf = document.querySelector('.box-result p');

var canvas1 = document.getElementById("cvs");
          // var elem = document.createElement('a');
var ctx =canvas1.getContext('2d');
           //elem.href = canvas.toDataURL("image/png");*
var vivi = document.getElementById('sourcevid');



 
        let progressBar = 
            new ProgressBar.Circle('#progress', {
            color: 'limegreen',
            strokeWidth: 10,
            duration: 2000, // milliseconds
            easing: 'easeInOut'
        });   

        async function fetchData(){
            let response = await fetch('./class_indices.json');
            let data = await response.json();
            data = JSON.stringify(data);
            data = JSON.parse(data);
            return data;
        }

         // here the data will be return.
        

        // Initialize/Load model
        async function initialize() {
            let status = document.querySelector('.init_status');
            status.innerHTML = 'Chargement du Modèle .... <span class="fa fa-spinner fa-spin"></span>';
            model = await tf.loadLayersModel('./tensorflowjs-model/model.json');
            status.innerHTML = 'Modèle chargé avec succès  <span class="fa fa-check"></span>';
        }

        async function predict() {
            // Function for invoking prediction 
           let img = document.getElementById('image');
 
 
            let offset = tf.scalar(255);
            let tensorImg =   tf.browser.fromPixels(img).resizeNearestNeighbor([224,224]).toFloat().expandDims().reverse(-1);
            let tensorImg_scaled = tensorImg.div(offset);
            //console.log(tensorImg_scaled);
             
            prediction = await model.predict(tensorImg_scaled).data();

				console.log(prediction);
				let Result = {
									0: "Fresh",
									1: "Rotten"
								};
				let order = Array.from(prediction)
					.map(function (p, i) { 
						return {
							probability: p,
							className: Result[i] 
						};
					}).sort(function (a, b) {
						return b.probability - a.probability;
					}).slice(0, 2);
			    

			    $("#list").empty();
	             order.forEach(function (p) {
		        $("#list").append(`<li>${p.className}: ${parseInt(Math.trunc(p.probability * 100))} %</li>`);
	              });

            fetchData().then((data)=> 
                {
                    predicted_class =  tf.argMax(prediction);


                     
                    class_idx = Array.from(predicted_class.dataSync())[0];
                    document.querySelector('.pred_class').innerHTML = data[class_idx];
                    document.querySelector('.inner').innerHTML = `${parseFloat(prediction[class_idx]*100).toFixed(2)}% SURE`;
                    console.log(data);
                    console.log(data[class_idx]);
                    console.log(prediction);

                    progressBar.animate(prediction[class_idx]-0.005); // percent de Progression

                    pconf.style.display = 'block';

                    confidence.innerHTML = Math.trunc(prediction[class_idx]*100);
  
                }
            );
            
        }

        

        fileUpload.addEventListener('change', function(e){
            
            let uploadedImage = e.target.value;
            if (uploadedImage){
                document.getElementById("blankFile-1").innerHTML = uploadedImage.replace("C:\\fakepath\\","");
                document.getElementById("choose-text-1").innerText = "Change Selected Image";
                document.querySelector(".success-1").style.display = "inline-block";
                 d6.style.display = "none";
                let extension = uploadedImage.split(".")[1];
                if (!(["doc","docx","pdf"].includes(extension))){
                    document.querySelector(".success-1 i").style.border = "1px solid limegreen";
                    document.querySelector(".success-1 i").style.color = "limegreen";
                }else{
                    document.querySelector(".success-1 i").style.border = "1px solid rgb(25,110,180)";
                    document.querySelector(".success-1 i").style.color = "rgb(25,110,180)";
                 }
            }
            let file = this.files[0];
            if (file){
                boxResult.style.display = 'block';
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener("load", function(){
                    
                    img.style.display = "block";
                    img.setAttribute('src', this.result);
                });
            } 

            else{
            img.setAttribute("src", "");
            }

            initialize().then( () => { 
                predict();
            })
        })

        fileUpload1.addEventListener('change', function(e){
            
            let uploadedImage = e.target.value;
            if (uploadedImage){
                document.getElementById("blankFile-1").innerHTML = uploadedImage.replace("C:\\fakepath\\","");
                document.getElementById("choose-text-1").innerText = "Change Selected Image";
                document.querySelector(".success-1").style.display = "inline-block";
                 d6.style.display = "none";
                let extension = uploadedImage.split(".")[1];
                if (!(["doc","docx","pdf"].includes(extension))){
                    document.querySelector(".success-1 i").style.border = "1px solid limegreen";
                    document.querySelector(".success-1 i").style.color = "limegreen";
                }else{
                    document.querySelector(".success-1 i").style.border = "1px solid rgb(25,110,180)";
                    document.querySelector(".success-1 i").style.color = "rgb(25,110,180)";
                 }
            }
            let file = this.files[0];
            if (file){
                boxResult.style.display = 'block';
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener("load", function(){
                    
                    img.style.display = "block";
                    img.setAttribute('src', this.result);
                });
            }

            else{
            img.setAttribute("src", "");
            }

            initialize().then( () => { 
                predict();
            })
        })

    fileUpload2.addEventListener('change', function(e){
            
            let uploadedImage = e.target.value;
            if (uploadedImage){
                document.getElementById("blankFile-1").innerHTML = uploadedImage.replace(sauver(),"");
                document.getElementById("choose-text-1").innerText = "Change Selected Image";
                document.querySelector(".success-1").style.display = "inline-block";
                 d6.style.display = "none";
                let extension = uploadedImage.split(".")[1];
                if (!(["doc","docx","pdf"].includes(extension))){
                    document.querySelector(".success-1 i").style.border = "1px solid limegreen";
                    document.querySelector(".success-1 i").style.color = "limegreen";
                }else{
                    document.querySelector(".success-1 i").style.border = "1px solid rgb(25,110,180)";
                    document.querySelector(".success-1 i").style.color = "rgb(25,110,180)";
                 }
            }
            let file = this.files[0];
            if (file){
                boxResult.style.display = 'block';
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener("load", function(){
                    
                    img.style.display = "block";
                    img.setAttribute('src', this.result);
                });
            }

            else{
            img.setAttribute("src", "");
            }

            initialize().then( () => { 
                predict();
            })
        })