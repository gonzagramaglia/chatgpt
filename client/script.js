import vegapunk from './assets/vegapunk.png';
import robin from './assets/robin.png';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat-container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = ''
    }
  }, 300);
}

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++
    }else {
      clearInterval(interval)
    }
  }, 20);
}

function generateUniqueId(){
  const timeStamp = Date.now();
  const hexadecimalString = Math.random().toString(16)

  return `id-${timeStamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId){
  return(
    `
      <div class='wrapper ${isAi && 'ai'}'>
        <div class='chat' >
            <img 
              class='profile'
              src='${isAi ? vegapunk : robin}'
              alt='${isAi ? 'bot' : 'user'}'
            />
          <div 
            class='message' 
            id=${uniqueId}
          >${value}
          </div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  // fetch data from server -> bot's response
  const response = await fetch('https://chatgpt-0cf9.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
  
  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "🧪💥 Ups, looks like something went wrong. But ironically that's normal! This is how knowledge develops 😜";

    alert(err)
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    handleSubmit(e)
  }
})