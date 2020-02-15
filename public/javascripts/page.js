// chrome AMK
const searchBar = document.querySelector('#search-bar')
const devices = document.querySelectorAll('.device')

searchBar.addEventListener('keyup', event => {
  let criteria = event.target.value
  let regex = new RegExp('.?' + criteria, 'gmi')
  devices
    .forEach(device => {
      if (device.innerHTML.match(regex))
        device.classList.remove('hidden')
      else
        device.classList.add('hidden')
    })
})