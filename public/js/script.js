const fullscreenButton = document.querySelector('.main-body__button>button');
const mainBody = document.querySelector(".main__body");

function toggleFullScreen() {
    var elem = document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {
        mainBody.classList.add('none');
    } else {
        mainBody.classList.remove('none');
    }
});

document.addEventListener('webkitfullscreenchange', function() {
    if (document.webkitFullscreenElement) {
        mainBody.classList.add('none');
    } else {
        mainBody.classList.remove('none');
    }
});

document.addEventListener('mozfullscreenchange', function() {
    if (document.mozFullScreenElement) {
        mainBody.classList.add('none');
    } else {
        mainBody.classList.remove('none');
    }
});

document.addEventListener('MSFullscreenChange', function() {
    if (document.msFullscreenElement) {
        mainBody.classList.add('none');
    } else {
        mainBody.classList.remove('none');
    }
});

function fetchData(chatId) {
    fetch('/api/data?chatId=' + chatId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('time').innerText = data.time;
            document.getElementById('timer').innerText = data.timer;

            setTimeout(() => fetchData(chatId), 1000);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
let url = window.location.href;
let chatId = url.split('/').pop();
fetchData(chatId);
function reloadPage() {
    if (document.getElementById("timer").innerText === "00:00") {
        window.location.reload();
    }
}
reloadPage();
setInterval(reloadPage, 2000);