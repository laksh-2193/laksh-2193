function openFullscreen() {
    var elem = document.getElementById('jaas-container');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

window.onload = () => {
    const el = document.getElementById('jaas-container');
    const meetid = getMeetIdFromURL();

    if (!meetid) {
        window.location.href = "error.html";
        return;
    }


    isValidMeeting();
    const api = new JitsiMeetExternalAPI("8x8.vc", {
        roomName: "vpaas-magic-cookie-ee4fa37a0fb74ec89883fd85bcf6b4db/" + meetid,
        parentNode: el,
    });

    // Fullscreen button event listeners
    const openFullscreenBtn = document.getElementById('openFullscreenBtn');
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');

    openFullscreenBtn.addEventListener('click', openFullscreen);
    closeFullscreenBtn.addEventListener('click', closeFullscreen);
};

function getMeetIdFromURL() {
    const currentURL = window.location.href;
    const urlParts = currentURL.split('=');
    const urlPartsLength = urlParts.length;

    if (urlPartsLength < 2) {
        return null;
    }

    return urlParts[urlPartsLength - 1];
}

function isValidMeeting()
{
    const url = "https://script.google.com/macros/s/AKfycbyqupn143Yocvy5_MSUAlOkTRfcogbXoVpCgumpzWTw5Pd0nBCkEoNSvgXGSjrT2WT5CQ/exec";
fetch(url)
  .then(response => response.json())
  .then(data => {
    const isEvent = data.isEvent;
    const description = data.description;
   
    if(!isEvent)
    {
        window.location.href = "error.html";
        return;

    }
    if(description.includes(getMeetIdFromURL()) || getMeetIdFromURL()=='instant2193' )
        {
            console.log(getMeetIdFromURL());
            
        }
        else
        {
             window.location.href = "error.html";


        }

  })
  .catch(error => {
    console.error("----------------------------Error:", error);
  });


}
