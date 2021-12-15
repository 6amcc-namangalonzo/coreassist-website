function toggleButton() {
    let element = document.getElementsByClassName('nav-bar')
    if (element[0].classList.length == 3) {
        element[0].classList.remove('nav-bar-collapse')
    } else {
        element[0].classList.add('nav-bar-collapse')
    }
}
