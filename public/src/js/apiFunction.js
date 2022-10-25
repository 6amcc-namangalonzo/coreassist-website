// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js'
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-analytics.js'
// TODO: Add SDKs for Firebase products that you want to use
import {
  getStorage,
  uploadBytes,
  ref as ref_storage,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js'

import {
  getDatabase,
  set,
  ref,
  onValue,
  push,
  remove,
} from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js'

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js'

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDp1hmnTdY_hnfSWgTNWAHTfjEvF6zKgVU',
  authDomain: 'coreassist-website.firebaseapp.com',
  databaseURL: 'https://coreassist-website-default-rtdb.firebaseio.com',
  projectId: 'coreassist-website',
  storageBucket: 'coreassist-website.appspot.com',
  messagingSenderId: '215351692392',
  appId: '1:215351692392:web:d27c30038dc502728e7fdd',
  measurementId: 'G-QDHJGW3VXE',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const submitData = document.getElementById('SubmitButton')
const btnRefreshApplicant = document.getElementById('RefreshButton')
const btnDelleteApplicant = document.getElementById('DeleteButton')

const tableApplicantsContainer = document.getElementById('table_applicants')

const fileInputOnchange = document.getElementById('FiResume')
const inputLabel = document.getElementById('lblFiResume')

const btnSignIn = document.getElementById('btnSignIn')

if (fileInputOnchange != null) {
  fileInputOnchange.onchange = () => {
    inputLabel.innerHTML = fileInputOnchange.files[0].name
  }
}

const getObj = (inputObject, url, fileName) => {
  const selectedPosition = document.getElementById('dd_position')
  const selectedRemoteExperience = document.getElementById(
    'dd_remote_experience'
  )
  const selectedEmployementStatus = document.getElementById(
    'dd_employment_status'
  )
  const obj = {
    email: inputObject.tb_email.value,
    last_name: inputObject.tb_last_name.value,
    first_name: inputObject.tb_first_name.value,
    middle_name: inputObject.tb_middle_name.value,
    date_of_birth: inputObject.tb_date_of_birth.value,
    contact_no: inputObject.tb_contact_no.value,
    position:
      inputObject.dd_position.options[selectedPosition.selectedIndex].value,
    salary: inputObject.tb_salary.value,
    work_experience_remote:
      inputObject.dd_remote_experience.options[
        selectedRemoteExperience.selectedIndex
      ].value,
    power_outage: inputObject.tb_power_outage.value,
    data_outage: inputObject.tb_data_outage.value,
    employement_status:
      inputObject.dd_employment_status.options[
        selectedEmployementStatus.selectedIndex
      ].value,
    url: url,
    file_name: fileName,
  }
  return obj
}
const setObj = () => {
  const inputObject = {
    tb_email: document.getElementById('tb_email'),
    tb_last_name: document.getElementById('tb_last_name'),
    tb_first_name: document.getElementById('tb_first_name'),
    tb_middle_name: document.getElementById('tb_middle_name'),
    tb_date_of_birth: document.getElementById('tb_date_of_birth'),
    tb_contact_no: document.getElementById('tb_contact_no'),
    dd_position: document.getElementById('dd_position'),
    tb_salary: document.getElementById('tb_salary'),
    dd_remote_experience: document.getElementById('dd_remote_experience'),
    tb_power_outage: document.getElementById('tb_power_outage'),
    tb_data_outage: document.getElementById('tb_data_outage'),
    dd_employment_status: document.getElementById('dd_employment_status'),
    fileInput: document.getElementById('FiResume'),
  }
  return inputObject
}
if (submitData != null) {
  submitData.onclick = async () => {
    const fileInput = document.getElementById('FiResume').files[0]

    const inputObject = await setObj()
    let isEmpty = false
    for (let obj in inputObject) {
      if (inputObject[obj].value === '')
        inputObject[obj].classList.add('is-invalid')
      else inputObject[obj].classList.remove('is-invalid')
    }
    for (let obj in inputObject) {
      if (inputObject[obj].value === '') {
        isEmpty = true
        break
      }
    }
    if (!isEmpty) {
      const db = await getDatabase(app)
      const storage = await getStorage()

      const postRef = await ref(db, 'Applicant')
      const newPostRef = await push(postRef)
      const key = await newPostRef.key
      const filename = fileInput.name
      const filenameExtension = '.' + filename.split('.')[1]
      const newFileName = key + filenameExtension

      const storageRef = await ref_storage(
        storage,
        'resume/' + key + filenameExtension
      )
      await uploadBytes(storageRef, fileInput)
      const dlUrl = await getDownloadURL(storageRef)

      const obj = await getObj(inputObject, dlUrl, newFileName)

      await set(newPostRef, obj)

      for (let obj in inputObject) {
        if (obj == 'dd_position') continue

        if (obj == 'dd_remote_experience') continue

        if (obj == 'dd_employment_status') continue
        inputObject[obj].value = ''
      }
      inputLabel.innerHTML = ''

      console.log('Applicant Added')
      alert('Applicant Added')
    }
  }
}

if (btnDelleteApplicant != null) {
  btnDelleteApplicant.onclick = async () => {
    const cb = document.getElementsByName('cbInfo')
    for (let num1 in cb) {
      if (cb[num1].checked) {
        const db = await getDatabase(app)
        const storage = await getStorage()

        const getData = ref(db, 'Applicant/' + cb[num1].value)
        await onValue(getData, (a) => {
          let value = a.val()

          const fileRef = ref_storage(storage, 'resume/' + value.file_name)
          remove(ref(db, 'Applicant/' + cb[num1].value))
          deleteObject(fileRef)
            .then(() => {
              console.log('File Deleted')
            })
            .then(() => {
              refreshList()
            })
            .catch((error) => {
              console.log(error)
            })
        })
      }
    }
  }
}

const refreshList = async () => {
  const tableApplicants = tableApplicantsContainer.tBodies[0]
  const newtableApplicants = document.createElement('tbody')
  //tableApplicants.parentNode.replaceChild(newtableApplicants, tableApplicants)
  var isEmpty = true
  if (tableApplicants.rows.length > 0) {
    isEmpty = false
  }
  while (!isEmpty) {
    if (tableApplicants.rows.length == 0) {
      isEmpty = true
      break
    }
    tableApplicants.deleteRow(0)
  }
  const db = getDatabase(app)
  const getData = ref(db, 'Applicant')
  onValue(getData, (a) => {
    var result = a.val()
    let count = 1

    for (let id in result) {
      const checkBoxElement = document.createElement('input')
      checkBoxElement.setAttribute('type', 'checkbox')
      checkBoxElement.setAttribute('name', 'cbInfo')
      checkBoxElement.setAttribute('value', id)
      const newElement = document.createElement('a')
      newElement.setAttribute('href', result[id]['url'])
      newElement.innerHTML = 'Link'
      //var row = tableApplicants.insertRow(count)
      var newRow = tableApplicants.insertRow()
      newRow.insertCell().appendChild(checkBoxElement)
      newRow.insertCell().innerHTML = count
      newRow.insertCell().innerHTML = result[id]['first_name']
      newRow.insertCell().innerHTML = result[id]['middle_name']
      newRow.insertCell().innerHTML = result[id]['last_name']
      newRow.insertCell().innerHTML = new Date(
        result[id]['date_of_birth']
      ).toLocaleDateString('en-GB')
      newRow.insertCell().innerHTML = result[id]['contact_no']
      newRow.insertCell().innerHTML = result[id]['email']
      newRow.insertCell().innerHTML = result[id]['position']
      newRow.insertCell().innerHTML = result[id]['salary']
      newRow.insertCell().innerHTML = result[id]['work_experience_remote']
      newRow.insertCell().innerHTML = result[id]['power_outage']
      newRow.insertCell().innerHTML = result[id]['data_outage']
      newRow.insertCell().innerHTML = result[id]['employement_status']
      newRow.insertCell().appendChild(newElement)

      count++
    }
  })
}

if (btnRefreshApplicant != null) {
  btnRefreshApplicant.onclick = async () => {
    await refreshList()
  }
}

btnSignIn.onclick = async () => {
  const auth = getAuth(app)

  const tbObj = {
    tbUsername: document.getElementById('tbUsername'),
    tbPassword: document.getElementById('tbPassword'),
  }

  signInWithEmailAndPassword(
    auth,
    tbObj.tbUsername.value,
    tbObj.tbPassword.value
  )
    .then((userCRed) => {
      location.href = 'applicants.html'
    })
    .catch((error) => {
      const errors = error.code
      const errorMessage = error.message
      console.log(errorMessage)
    })
}
