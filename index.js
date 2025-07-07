
const video = document.getElementById('webcam');
const scannerContainer = document.getElementById('scanner-container');
const resultContainer = document.getElementById('result-container');
const loadingScreen = document.getElementById('loading-screen');
const resultText = document.getElementById('result-text');
const startButton = document.getElementById('start-button');


let model;


const confettiColors = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#66BB6A', '#AED581', '#F0F4C3'];
const confettiCount = 150;
let confettiElements = [];


let isScanning = false;
let scanInterval;
let scanTimeout;
let resultShown = false;


const clubMateTypes = {
    'Club-Mate Original': 'Du bist eine ORIGINAL CLUB-MATE! Klassisch, zuverlässig und die erste Wahl für viele. Du bist authentisch und bleibst dir selbst treu!',
    'Club-Mate Granat': 'Du bist eine CLUB-MATE GRANAT! Fruchtig, überraschend und mit einer besonderen Note. Du hebst dich gerne von der Masse ab!',
    'Club-Mate Winteredition': 'Du bist eine CLUB-MATE WINTEREDITION! Saisonal, besonders und nur für kurze Zeit verfügbar. Du bist etwas ganz Besonderes!',
    'Club-Mate Cola': 'Du bist eine CLUB-MATE COLA! Die perfekte Mischung aus Tradition und Innovation. Du vereinst verschiedene Welten mit Leichtigkeit!',
    'Club-Mate Eistee': 'Du bist ein CLUB-MATE EISTEE! Erfrischend, entspannt und perfekt für den Sommer. Du bringst immer gute Laune mit!'
};


async function init() {
    
    scannerContainer.style.display = 'none';
    loadingScreen.style.display = 'none';
    resultContainer.style.display = 'none';
    startButton.style.display = 'block';
    
    
    if (!document.getElementById('title-container')) {
        const titleContainer = document.createElement('div');
        titleContainer.id = 'title-container';
        titleContainer.innerHTML = `
            <h1 class="main-title">WELCHE CLUBMATE BIST DU?</h1>
            <p class="subtitle">Der ultimative Kunststudenten-Test</p>
        `;
        document.body.insertBefore(titleContainer, document.body.firstChild);
    }
    
    
    addStyles();
    
    
    try {
        model = await tmImage.load('https://teachablemachine.withgoogle.com/models/mhIrZMBId/model.json', 'https://teachablemachine.withgoogle.com/models/mhIrZMBId/metadata.json');
        console.log('Modell erfolgreich geladen!');
    } catch (error) {
        console.error('Fehler beim Laden des Modells:', error);
        alert('Das Modell konnte nicht geladen werden. Bitte Seite neu laden oder später versuchen!');
    }
}


function setupStartButton() {
    startButton.addEventListener('click', startScanning);
}


async function startScanning() {
    if (isScanning) return;
    
    isScanning = true;
    resultShown = false;
    clearConfetti();
    
    
    startButton.style.display = 'none';
    resultContainer.style.display = 'none';
    scannerContainer.style.display = 'block';
    
    try {
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        
        
        video.srcObject = stream;
        video.play();
        
        
        setTimeout(() => {
            
            scannerContainer.style.display = 'none';
            loadingScreen.style.display = 'flex';
            
            
            animateScanner();
            
            
            scanTimeout = setTimeout(() => {
                stopScanning();
                showResult();
            }, 5000);
            
            
            scanInterval = setInterval(async () => {
                if (!model || !video.readyState === 4) return;
                
                const prediction = await model.predict(video);
                console.log('Vorhersage:', prediction);
                
                
                let highestProbability = 0;
                let bestMatch = '';
                
                for (let i = 0; i < prediction.length; i++) {
                    if (prediction[i].probability > highestProbability) {
                        highestProbability = prediction[i].probability;
                        bestMatch = prediction[i].className;
                    }
                }
                
                
                sessionStorage.setItem('clubMateResult', bestMatch);
            }, 500);
            
        }, 2000); 
        
    } catch (error) {
        console.error('Fehler beim Zugriff auf die Kamera:', error);
        isScanning = false;
        startButton.style.display = 'block';
        alert('Kein Zugriff auf die Kamera. Bitte erlaube den Zugriff und versuche es erneut!');
    }
}


function stopScanning() {
    isScanning = false;
    
    
    clearInterval(scanInterval);
    clearTimeout(scanTimeout);
    
    
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    
    loadingScreen.style.display = 'none';
    scannerContainer.style.display = 'none';
}


function showResult() {
    if (resultShown) return;
    resultShown = true;
    
    const result = sessionStorage.getItem('clubMateResult') || Object.keys(clubMateTypes)[Math.floor(Math.random() * Object.keys(clubMateTypes).length)];
    const description = clubMateTypes[result] || 'Du bist eine einzigartige CLUB-MATE! Individuell und nicht in Schubladen zu stecken.';
    
    
    resultText.innerHTML = `
        <h2>${result}</h2>
        <p>${description}</p>
    `;
    
    resultContainer.style.display = 'flex';
    createConfetti();
    
    
    setTimeout(() => {
        startButton.textContent = 'Nochmal versuchen';
        startButton.style.display = 'block';
    }, 2000);
}


function animateScanner() {
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    loadingScreen.appendChild(scanLine);
    
    
    for (let i = 0; i < 5; i++) {
        const scanElement = document.createElement('div');
        scanElement.className = 'scan-element';
        scanElement.style.left = `${Math.random() * 80 + 10}%`;
        scanElement.style.animationDelay = `${Math.random() * 2}s`;
        loadingScreen.appendChild(scanElement);
    }
    
    
    const scanText = document.createElement('div');
    scanText.className = 'scan-text';
    scanText.innerHTML = 'SCANNING...';
    loadingScreen.appendChild(scanText);
}


function createConfetti() {
    clearConfetti();
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random()}s`;
        
        document.body.appendChild(confetti);
        confettiElements.push(confetti);
    }
    
    
    setTimeout(clearConfetti, 5000);
}


function clearConfetti() {
    confettiElements.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    confettiElements = [];
}


function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Londrina+Solid:wght@400;900&display=swap');
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #E8F5E9;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        #title-container {
            text-align: center;
            margin: 2rem 0;
            width: 100%;
        }
        
        .main-title {
            font-family: 'Bebas Neue', 'Londrina Solid', cursive;
            font-size: 3.5rem;
            font-weight: 900;
            color: #000;
            margin-bottom: 0.5rem;
            letter-spacing: 2px;
            text-shadow: 3px 3px 0px rgba(0, 100, 0, 0.2);
            animation: pulse 1.5s infinite alternate;
        }
        
        .subtitle {
            font-family: 'Londrina Solid', cursive;
            font-size: 1.5rem;
            color: #2E7D32;
            margin-top: 0;
        }
        
        #start-button {
            padding: 15px 30px;
            font-family: 'Londrina Solid', cursive;
            font-size: 1.5rem;
            background-color: #2E7D32;
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            margin: 2rem 0;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        #start-button:hover {
            background-color: #1B5E20;
            transform: scale(1.05);
        }
        
        #scanner-container, #loading-screen {
            width: 80%;
            max-width: 600px;
            height: 450px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
            margin: 1rem 0;
            position: relative;
        }
        
        #webcam {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        #loading-screen {
            background-color: #1B5E20;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .scan-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, transparent, #A5D6A7, transparent);
            animation: scan 2s linear infinite;
        }
        
        .scan-element {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #A5D6A7;
            border-radius: 50%;
            opacity: 0;
            animation: pulse-element 3s ease-in-out infinite;
        }
        
        .scan-text {
            font-family: 'Bebas Neue', cursive;
            font-size: 2rem;
            letter-spacing: 3px;
            animation: blink 1s infinite alternate;
        }
        
        #result-container {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80%;
            max-width: 600px;
            padding: 2rem;
            background-color: #A5D6A7;
            border-radius: 20px;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
            margin: 2rem 0;
            text-align: center;
            animation: pop-in 0.5s forwards;
        }
        
        #result-text h2 {
            font-family: 'Bebas Neue', 'Londrina Solid', cursive;
            font-size: 2.5rem;
            color: #000;
            margin-bottom: 1rem;
            animation: scale-in 0.5s 0.2s forwards;
            opacity: 0;
            transform: scale(0.8);
        }
        
        #result-text p {
            font-family: 'Arial', sans-serif;
            font-size: 1.2rem;
            color: #1B5E20;
            line-height: 1.6;
            animation: fade-in 0.5s 0.4s forwards;
            opacity: 0;
        }
        
        .confetti {
            position: fixed;
            top: -10px;
            animation: fall linear forwards;
            z-index: 1000;
        }
        
        @keyframes scan {
            0% { transform: translateY(0); }
            50% { transform: translateY(450px); }
            50.001% { transform: translateY(0); }
            100% { transform: translateY(450px); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
        }
        
        @keyframes pulse-element {
            0% { transform: scale(0.5); opacity: 0.8; }
            50% { transform: scale(1.5); opacity: 0; }
            100% { transform: scale(0.5); opacity: 0.8; }
        }
        
        @keyframes blink {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes scale-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .main-title {
                font-size: 2.5rem;
            }
            
            .subtitle {
                font-size: 1.2rem;
            }
            
            #scanner-container, #loading-screen {
                height: 350px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}


function createHTMLStructure() {
    
    if (!document.getElementById('scanner-container')) {
        const scannerContainer = document.createElement('div');
        scannerContainer.id = 'scanner-container';
        scannerContainer.innerHTML = '<video id="webcam" playsinline></video>';
        document.body.appendChild(scannerContainer);
    }
    
    if (!document.getElementById('loading-screen')) {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        document.body.appendChild(loadingScreen);
    }
    
    if (!document.getElementById('result-container')) {
        const resultContainer = document.createElement('div');
        resultContainer.id = 'result-container';
        resultContainer.innerHTML = '<div id="result-text"></div>';
        document.body.appendChild(resultContainer);
    }
    
    if (!document.getElementById('start-button')) {
        const startButton = document.createElement('button');
        startButton.id = 'start-button';
        startButton.textContent = 'Test starten';
        document.body.appendChild(startButton);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    createHTMLStructure();
    init();
    setupStartButton();
});