let btn = document.querySelector('#btn');
let ham = btn.querySelectorAll('svg')
btn.addEventListener('click', function () {
  console.log(btn);
  document.querySelector('#mobile-menu').classList.toggle('hidden');
  ham.forEach(function (el) {
    el.classList.toggle('hidden');
  })
});

document.querySelectorAll('.url').forEach(function(el){
  el.setAttribute('href', window.location.href);
});

function copyName(target){
  let item = target.parentNode.parentNode.querySelector('span').innerText
  navigator.clipboard.writeText(item)
  // alert(`Copied ${item} to clipboard`)
}
function copyLink(target){
  let item = target.parentNode.parentNode.querySelector('a').href
  navigator.clipboard.writeText(item)
  // alert(`Copied ${item} to clipboard`)
}
function copyNameAll() {
  let item = document.getElementById('filename').innerText
  navigator.clipboard.writeText(item)
  console.log(item);
}
function copyLinkAll() {
  let item = document.getElementById('download').innerText
  navigator.clipboard.writeText(item)
  console.log(item);
}

let editor = CodeMirror.fromTextArea(document.getElementById("input"), {
  lineNumbers: true,
  styleActiveLine: true,
  lineWrapping:true,
  autofocus: true,
});

function sortFunction(a, b) {
  if (a['line'] === b['line']) {
      return 0;
  }
  else {
      return (a['line'] < b['line']) ? -1 : 1;
  }

}

// get google drive
const go = document.getElementById('go');
go.addEventListener('click', () => {
  document.getElementById("result").innerHTML = "";
  document.getElementById('go').classList.add('hidden');
  document.getElementById('processing').classList.remove('hidden');
  document.getElementById('processing').classList.add('inline-flex');

  // wait 5s
  const sleepUntil = async (f, timeoutMs) => {
    return new Promise((resolve, reject) => {
      const timeWas = new Date();
      const wait = setInterval(function() {
        if (f()) {
          console.log("resolved after", new Date() - timeWas, "ms");
          clearInterval(wait);
          resolve();
        } else if (new Date() - timeWas > timeoutMs) { // Timeout
          console.log("rejected after", new Date() - timeWas, "ms");
          clearInterval(wait);
          reject();
        }
      }, 20);
    });
  }
  sleepUntil(() => document.querySelector('#result').innerText, 5000)
  .then(() => {
      // console.log('ok');
  }).catch(() => {
      // console.log('timeout');
      document.getElementById('notif').innerHTML = "The process may take 15 seconds to more";
  });

  let input = editor.getValue().split('\n')
  let success = []
  let error = []

  Promise.all(input.map((x, y) =>
    fetch('https://api.alif.my.id/gddl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'url' : x
      })
    })
    .then(res => res.json())
    .then(res => {
      let status = res.status;
      if (status == "success") {
        // console.log((y+1)+ " : " + res.data.name);
        success.push({
          'data' : res.data,
          'line'  : (y+1)
      });
      }
      else if(status == "error"){
        // console.log((y+1)+ " : " + status);
        error.push(y+1);
      }
      else {
        console.log((y+1)+ " : " + status)
      }
    })
  ))
  .then(data => {
    success.sort(sortFunction)
    error.sort((a, b) => {return a-b})

    document.getElementById('go').classList.remove('hidden');
    document.getElementById('processing').classList.add('hidden');
    document.getElementById('processing').classList.remove('inline-flex');
    document.getElementById('notif').innerHTML = "";

    if(error.length > 0 || success.length){
      document.getElementById("result").innerHTML += `
      <p class="text-2xl text-center font-semibold underline title tracking-widest mb-5">Result</p>
      `
    }

    if(error.length > 0){
      document.getElementById("result").innerHTML += `
      <hr class="mt-5 mb-3">
      <p class="italic">Error at line <span class="text-red-600">${error.join(', ')}</span></p>
      <hr class="my-3"> `
    }

    if(success.length) {
      document.getElementById("result").innerHTML += `
      <textarea id="filename" class="hidden">${
        success.map(x => x.data.name).join('\n')
      }</textarea>
      <textarea id="download" class="hidden">${
        success.map(x => x.data.download).join('\n')
      }</textarea>
      <div class="border border-red-600 w-fit pt-3 pb-4 px-5 rounded-md mx-auto">

      <button class="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-3 mt-1 rounded-md focus:outline-none mx-1 focus:ring focus:ring-green-600" onclick="copyNameAll()" x-data
      @click="$store.toasts.createToast('All File Names Copied!', 'success')">Copy All File Names</button>
      <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-1 px-3 mt-1 rounded-md focus:outline-none mx-1 focus:ring focus:ring-yellow-600" onclick="copyLinkAll()" x-data
      @click="$store.toasts.createToast('All Direct Links Copied!', 'warning')">Copy All Direct Links</button>
      </div>
      `
      success.forEach(x => {
        document.getElementById("result").innerHTML += `
        <div class="card my-5 pb-5 pt-3 border border-slate-400 bg-slate-200 rounded-md focus:ring focus:ring-violet-300">
          <div class="card-body">
            <span class="card-title">${x.data.name}</span>
            <span class="card-title">[${x.data.size}]</span>
            <div class="flex flex-wrap justify-center">
              <button class="bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-3 mt-1 rounded-md focus:outline-none mx-1 focus:ring focus:ring-green-600" onclick="copyName(this)" x-data
              @click="$store.toasts.createToast('File Names Copied!', 'success')">Copy File Name</button>
              <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-1 px-3 mt-1 rounded-md focus:outline-none mx-1 focus:ring focus:ring-yellow-600" onclick="copyLink(this)" x-data @click="$store.toasts.createToast('Direct Link Copied!', 'warning')">Copy Direct Link</button>
              <a href="${x.data.download}" target="_blank" class="mx-1">
                <button class="bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-3 mt-1 rounded-md focus:outline-none">Download</button>
              </a>
            </div>
          </div>
        </div>
        `
      });
    }

    window.scrollTo({
      top: document.getElementById('result').offsetTop - 100,
      left: 0
    })

  })
})


// document.getElementById("result").innerHTML += `
//   <div class="card my-5 p-3 border">
//     <div class="card-body">
//       <span class="card-title">Nama Apps [2 GB]</span>

//       <div class="flex flex-wrap justify-center">
//         <a href="/" target="_blank" class="mx-1">
//           <button class="bg-green-500 hover:bg-green-700 text-white font-semibold px-1 mt-1 rounded-md focus:outline-none">Copy Name</button>
//         </a>
//         <a href="/" target="_blank" class="mx-1">
//           <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold px-1 mt-1 rounded-md focus:outline-none">Copy Link</button>
//         </a>
//         <a href="/" target="_blank" class="mx-1">
//           <button class="bg-red-500 hover:bg-red-700 text-white font-semibold px-1 mt-1 rounded-md focus:outline-none">Download</button>
//         </a>
//       </div>
//     </div>
//   </div>
//   `