// Set the date we're counting down to
var endDate = new Date("Sep 20, 2022 00:00:00").getTime();
// Update the count down every 1 second
var x = setInterval(function() {
    // Get todays date and time
    var now = new Date().getTime();
    // Find the distance between now an the count down date
    var distance = endDate - now;
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // Output the result in elements with id="cdHour/cdMin/cdSec"
    document.getElementById("daysNum").innerHTML = ("0" + days).slice(-2);  
    document.getElementById("hoursNum").innerHTML = ("0" + hours).slice(-2);
    document.getElementById("minsNum").innerHTML = ("0" + minutes).slice(-2);
    document.getElementById("secsNum").innerHTML = ("0" + seconds).slice(-2);
  
 if(parseInt(("0" + hours).slice(-2))<0)
   {
     window.location="https://drive.google.com/file/d/1ek-IwDMvi5dVLj6uEl8EYtFFu9_VZwXA/view?usp=drivesdk";
   }
    // If the count down is over, write some text 
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("countContainer").innerHTML = "EXPIRED";
    }
}, 1000);
