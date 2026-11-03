import { requireAdmin, supabase } from "./supabase-client.js"

const map = L.map("admin-map").setView([-6.914744, 107.609810], 13)
let pickerMarker = null
let currentRows = []

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors"
}).addTo(map)

const rowsElement = document.getElementById("arm-roll-rows")
const formCard = document.getElementById("arm-roll-form-card")
const form = document.getElementById("arm-roll-form")
const message = document.getElementById("admin-message")
const useMyLocationButton = document.getElementById("use-my-location")
const pickerStatus = document.getElementById("picker-status")
const fields = {
  originalCode: document.getElementById("original-code"),
  code: document.getElementById("arm-roll-code"),
  name: document.getElementById("arm-roll-name"),
  cameraId: document.getElementById("camera-id"),
  active: document.getElementById("is-active"),
  latitude: document.getElementById("latitude"),
  longitude: document.getElementById("longitude")
}

function setMessage(text, isError = false) {
  message.textContent = text
  message.className = `form-message${isError ? " error" : ""}`
}

function setPickerLocation(latitude, longitude, moveMap = false) {
  fields.latitude.value = Number(latitude).toFixed(6)
  fields.longitude.value = Number(longitude).toFixed(6)
  if (!pickerMarker) pickerMarker = L.marker([latitude, longitude]).addTo(map)
  else pickerMarker.setLatLng([latitude, longitude])
  pickerStatus.textContent = `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
  if (moveMap) map.setView([latitude, longitude], 16)
}

function showForm(armRoll = null) {
  form.reset()
  fields.originalCode.value = armRoll?.arm_roll_code || ""
  fields.code.value = armRoll?.arm_roll_code || ""
  fields.name.value = armRoll?.name || ""
  fields.cameraId.value = armRoll?.camera_id || ""
  fields.active.checked = armRoll?.is_active ?? true
  document.getElementById("form-title").textContent = armRoll ? "Ubah Arm Roll" : "Tambah Arm Roll"
  formCard.hidden = false
  if (armRoll) setPickerLocation(armRoll.latitude, armRoll.longitude, true)
  else {
    fields.latitude.value = ""
    fields.longitude.value = ""
    pickerStatus.textContent = "Pilih titik lokasi"
    if (pickerMarker) {
      map.removeLayer(pickerMarker)
      pickerMarker = null
    }
    map.setView([-6.914744, 107.609810], 13)
  }
  setTimeout(() => map.invalidateSize(), 0)
  formCard.scrollIntoView({ behavior: "smooth", block: "start" })
}

function hideForm() {
  formCard.hidden = true
  form.reset()
  if (pickerMarker) {
    map.removeLayer(pickerMarker)
    pickerMarker = null
  }
}

function makeButton(label, action, armRoll, danger = false) {
  const button = document.createElement("button")
  button.type = "button"
  button.textContent = label
  button.className = danger ? "table-button danger" : "table-button"
  button.addEventListener("click", () => action(armRoll))
  return button
}

function renderRows() {
  rowsElement.replaceChildren()
  currentRows.forEach((armRoll) => {
    const row = document.createElement("tr")
    const cells = [
      armRoll.arm_roll_code,
      armRoll.name,
      armRoll.camera_id || "-",
      `${Number(armRoll.latitude).toFixed(6)}, ${Number(armRoll.longitude).toFixed(6)}`,
      armRoll.status,
      armRoll.is_active ? "Aktif" : "Nonaktif"
    ]
    cells.forEach((value) => {
      const cell = document.createElement("td")
      cell.textContent = value
      row.append(cell)
    })
    const actions = document.createElement("td")
    actions.className = "row-actions"
    actions.append(
      makeButton("Edit", showForm, armRoll),
      makeButton("Hapus", removeArmRoll, armRoll, true)
    )
    row.append(actions)
    rowsElement.append(row)
  })
  if (!currentRows.length) {
    const row = document.createElement("tr")
    const cell = document.createElement("td")
    cell.colSpan = 7
    cell.textContent = "Belum ada Arm Roll."
    row.append(cell)
    rowsElement.append(row)
  }
}

async function loadArmRolls() {
  const { data, error } = await supabase
    .from("arm_rolls")
    .select("arm_roll_code,name,latitude,longitude,camera_id,status,confidence,is_active,updated_at")
    .order("arm_roll_code")
  if (error) {
    setMessage("Data Arm Roll tidak dapat dimuat.", true)
    return
  }
  currentRows = data
  renderRows()
}

async function removeArmRoll(armRoll) {
  if (!window.confirm(`Hapus ${armRoll.name} dari peta?`)) return
  const { error } = await supabase
    .from("arm_rolls")
    .delete()
    .eq("arm_roll_code", armRoll.arm_roll_code)
  if (error) {
    setMessage("Arm Roll gagal dihapus.", true)
    return
  }
  setMessage("Arm Roll berhasil dihapus.")
  await loadArmRolls()
}

map.on("click", (event) => {
  setPickerLocation(event.latlng.lat, event.latlng.lng)
  pickerStatus.textContent = "Lokasi dipilih dari peta."
})

function geolocationErrorMessage(error) {
  const messages = {
    1: "Izin lokasi ditolak. Izinkan lokasi di browser lalu coba lagi.",
    2: "Lokasi perangkat tidak tersedia. Periksa GPS atau koneksi perangkat.",
    3: "Pencarian lokasi terlalu lama. Coba lagi di area dengan sinyal lebih baik."
  }
  return messages[error.code] || "Lokasi tidak dapat ditemukan. Coba lagi."
}

useMyLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    pickerStatus.textContent = "Browser ini tidak mendukung geolocation."
    return
  }

  useMyLocationButton.disabled = true
  pickerStatus.textContent = "Mencari lokasi..."
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords
      setPickerLocation(latitude, longitude, true)
      map.setView([latitude, longitude], 17)
      pickerStatus.textContent = `Lokasi berhasil ditemukan. Akurasi ±${Math.round(accuracy)} meter`
      useMyLocationButton.disabled = false
    },
    (error) => {
      pickerStatus.textContent = geolocationErrorMessage(error)
      useMyLocationButton.disabled = false
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  )
})

document.getElementById("new-arm-roll").addEventListener("click", () => showForm())
document.getElementById("close-form").addEventListener("click", hideForm)
document.getElementById("cancel-form").addEventListener("click", hideForm)
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut()
  window.location.replace("/")
})

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const latitude = Number(fields.latitude.value)
  const longitude = Number(fields.longitude.value)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    setMessage("Pilih lokasi valid pada peta.", true)
    return
  }
  const payload = {
    arm_roll_code: fields.code.value.trim(),
    name: fields.name.value.trim(),
    latitude,
    longitude,
    camera_id: fields.cameraId.value.trim() || null,
    is_active: fields.active.checked
  }
  let error
  if (fields.originalCode.value) {
    ({ error } = await supabase
      .from("arm_rolls")
      .update(payload)
      .eq("arm_roll_code", fields.originalCode.value))
  } else {
    ({ error } = await supabase.from("arm_rolls").insert(payload))
  }
  if (error) {
    setMessage("Simpan gagal. Pastikan ID dan Camera ID aktif tidak duplikat.", true)
    return
  }
  setMessage("Arm Roll berhasil disimpan.")
  hideForm()
  await loadArmRolls()
})

const session = await requireAdmin()
if (session) {
  await loadArmRolls()
  window.addEventListener("load", () => map.invalidateSize())
}
