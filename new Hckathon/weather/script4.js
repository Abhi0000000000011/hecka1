







const apiKey = '2a2d5df143470281d93fffb2d71a2883';
let currentTemp = null;
let currentSeason = null;
let currentWeather = null;

function getWeather() {
    const district = document.getElementById('district').value;
    if (!district) {
        alert('Please select a district!');
        return;
    }

    // Current weather API
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(district)},IN&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert('Weather fetch failed: ' + data.message);
                return;
            }

            currentTemp = data.main.temp;
            currentWeather = data.weather[0].description;

            document.getElementById('location').innerText = district;
            document.getElementById('temperature').innerText = currentTemp.toFixed(1);
            document.getElementById('weather').innerText = currentWeather;
            document.getElementById('profile').classList.remove('hidden');

            currentSeason = getSeason();
            document.getElementById('season').innerText = currentSeason;

            updateCropSuggestions();
            getForecast(district);
            updateFarmingCalendar();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Could not fetch weather data.');
        });
}

function getForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},IN&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const forecastList = document.getElementById('forecast-list');
            const tipsList = document.getElementById('tips-list');
            forecastList.innerHTML = '';
            tipsList.innerHTML = '';

            const shownDates = new Set();

            data.list.forEach(item => {
                const date = new Date(item.dt_txt).toDateString();

                if (!shownDates.has(date)) {
                    shownDates.add(date); // Mark this date as shown

                    const li = document.createElement('li');
                    li.textContent = `${date}: ${item.weather[0].description}, ${item.main.temp.toFixed(1)}°C`;
                    forecastList.appendChild(li);

                    const tip = document.createElement('li');
                    if (item.weather[0].main.toLowerCase().includes('rain')) {
                        tip.textContent = `${date}: Avoid irrigation — rain expected.`;
                    } else if (item.main.temp > 35) {
                        tip.textContent = `${date}: Ensure crop shading and hydration.`;
                    } else {
                        tip.textContent = `${date}: Ideal conditions for field activities.`;
                    }
                    tipsList.appendChild(tip);
                }
            });
        })
        .catch(err => console.error('Forecast error:', err));
}


function getSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'Kharif';
    if (month >= 11 || month <= 3) return 'Rabi';
    return 'Zaid';
}

function updateCropSuggestions() {
    const soil = document.getElementById('soil').value.toLowerCase();
    if (!soil) {
        alert('Please select a soil type!');
        return;
    }
    if (currentTemp === null) {
        alert('Temperature not available yet!');
        return;
    }
    suggestCrops(currentTemp, soil, currentSeason);
}

function suggestCrops(temp, soil, season) {
    const cropsList = document.getElementById('crops-list');
    cropsList.innerHTML = '';

    let crops = [];

    if (soil.includes('clay')) {
        if (temp >= 25 && temp <= 35) crops = ['Rice', 'Sugarcane', 'Jute'];
        else if (temp >= 15 && temp < 25) crops = ['Wheat', 'Barley', 'Gram'];
        else crops = ['Peas', 'Mustard', 'Carrot'];
    } else if (soil.includes('sandy')) {
        if (temp >= 25 && temp <= 35) crops = ['Groundnut', 'Watermelon', 'Melon'];
        else if (temp >= 15 && temp < 25) crops = ['Potato', 'Tomato', 'Onion'];
        else crops = ['Cabbage', 'Spinach', 'Radish'];
    } else if (soil.includes('loamy')) {
        if (temp >= 20 && temp <= 30) crops = ['Maize', 'Cotton', 'Soybean'];
        else if (temp >= 15 && temp < 20) crops = ['Wheat', 'Mustard', 'Chickpea'];
        else crops = ['Carrot', 'Cauliflower', 'Peas'];
    } else if (soil.includes('black')) {
        if (temp >= 25 && temp <= 35) crops = ['Cotton', 'Soybean', 'Pulses'];
        else if (temp >= 15 && temp < 25) crops = ['Wheat', 'Linseed', 'Chickpea'];
        else crops = ['Millets', 'Sorghum'];
    } else {
        if (temp >= 20 && temp <= 30) crops = ['Rice', 'Maize', 'Sugarcane'];
        else if (temp < 20) crops = ['Wheat', 'Barley', 'Peas'];
        else crops = ['Millets', 'Sunflower'];
    }

    const originalCrops = [...crops];
    crops = crops.filter(crop => {
        if (season === 'Kharif') return ['Rice', 'Maize', 'Sugarcane', 'Groundnut', 'Cotton', 'Soybean', 'Jute', 'Millets'].includes(crop);
        if (season === 'Rabi') return ['Wheat', 'Barley', 'Gram', 'Mustard', 'Carrot', 'Peas', 'Linseed', 'Spinach', 'Onion', 'Radish'].includes(crop);
        if (season === 'Zaid') return ['Watermelon', 'Melon', 'Cucumber', 'Sunflower', 'Groundnut'].includes(crop);
        return true;
    });

    if (crops.length === 0) crops = originalCrops;
    if (crops.length === 0) {
        cropsList.innerHTML = '<li>No suitable crops found for your conditions.</li>';
    } else {
        crops.forEach(crop => {
            const li = document.createElement('li');
            li.innerText = crop;
            cropsList.appendChild(li);
        });
    }
}

document.getElementById('soil').addEventListener('change', () => {
    if (currentTemp !== null) {
        updateCropSuggestions();
    }
});

function updateFarmingCalendar() {
    const calendar = document.getElementById('calendar');
    const season = getSeason();

    const tips = {
        Kharif: [
            'June: Prepare soil and start sowing.',
            'July-August: Monitor pests and start irrigation.',
            'September-October: Begin harvesting crops.'
        ],
        Rabi: [
            'November: Plough field and sow seeds.',
            'December-January: Light irrigation as needed.',
            'February-March: Fertilization and harvesting.'
        ],
        Zaid: [
            'March-April: Sow short-duration crops.',
            'May: Regular watering due to high heat.',
            'June: Harvest and prepare for Kharif.'
        ]
    };

    calendar.innerHTML = `<h4>${season} Season Guide</h4><ul>` + tips[season].map(t => `<li>${t}</li>`).join('') + '</ul>';
}
function returnToMainMenu() {
    document.getElementById('profile').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');

    document.getElementById('district').value = '';
    document.getElementById('soil').value = '';
    document.getElementById('crops-list').innerHTML = '';
    document.getElementById('forecast-list').innerHTML = '';
    document.getElementById('tips-list').innerHTML = '';
    document.getElementById('calendar').innerHTML = '';
    document.getElementById('location').innerText = '';
    document.getElementById('temperature').innerText = '';
    document.getElementById('weather').innerText = '';
    document.getElementById('season').innerText = '';
}




