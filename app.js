const BANDUNG_CENTER = [-6.914744, 107.609810]
import { supabase, adminLoginUrl } from "./supabase-client.js"

const map = L.map("arm-roll-map", { scrollWheelZoom: true }).setView(BANDUNG_CENTER, 13)
const markers = new Map()
let fittedBounds = false
const statusColors = {
  FULL: "#b63a48",
  NOT_FULL: "#177a5d",
  NO_DETECTION: "#7a8797",
  OFFLINE: "#344255"
}

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors"
}).addTo(map)

function markerIcon(status) {
  const color = statusColors[status] || statusColors.OFFLINE
  return L.divIcon({
    className: "marker-wrapper",
    html: `<span class="marker" style="--marker-color:${color}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
}

function popupContent(armRoll) {
  const content = document.createElement("section")
  content.className = "popup"
  const title = document.createElement("h3")
  title.textContent = armRoll.name
  const status = document.createElement("p")
  status.innerHTML = "<span>Status</span>"
  const value = document.createElement("strong")
  value.textContent = armRoll.status
  status.append(value)
  const updated = document.createElement("p")
  updated.innerHTML = "<span>Pembaruan</span>"
  const updatedValue = document.createElement("strong")
  updatedValue.textContent = armRoll.updated_at
  updated.append(updatedValue)
  content.append(title, status, updated)
  return content
}

function updateMarker(armRoll) {
  let marker = markers.get(armRoll.arm_roll_code)
  const position = [armRoll.latitude, armRoll.longitude]
  if (!marker) {
    marker = L.marker(position, { icon: markerIcon(armRoll.status) }).addTo(map)
    marker.bindPopup(() => popupContent(marker.armRoll), { minWidth: 220 })
    markers.set(armRoll.arm_roll_code, marker)
  } else {
    marker.setLatLng(position)
    marker.setIcon(markerIcon(armRoll.status))
  }
  marker.armRoll = armRoll
}

async function refreshArmRolls() {
  const message = document.getElementById("map-message")
  try {
    const response = await fetch("/api/arm-rolls", { cache: "no-store" })
    if (!response.ok) throw new Error("Permintaan data gagal")
    const payload = await response.json()
    const activeCodes = new Set()
    payload.arm_rolls.forEach((armRoll) => {
      activeCodes.add(armRoll.arm_roll_code)
      updateMarker(armRoll)
    })
    markers.forEach((marker, code) => {
      if (!activeCodes.has(code)) {
        map.removeLayer(marker)
        markers.delete(code)
      }
    })
    if (!fittedBounds && payload.arm_rolls.length) {
      map.fitBounds(payload.arm_rolls.map((armRoll) => [armRoll.latitude, armRoll.longitude]), {
        padding: [36, 36],
        maxZoom: 15
      })
      fittedBounds = true
    }
    document.getElementById("last-update").textContent = payload.updated_at || "-"
    message.textContent = payload.arm_rolls.length
      ? ""
      : "Belum ada data Arm Roll yang tersedia."
  } catch (error) {
    message.textContent = "Data monitoring belum dapat dimuat. Coba beberapa saat lagi."
    document.getElementById("last-update").textContent = "Data belum tersedia"
  }
}

async function updateAdminLink() {
  const { data: { session } } = await supabase.auth.getSession()
  const header = document.querySelector(".header-content")
  const existing = document.getElementById("admin-link")
  if (existing) existing.remove()
  const link = document.createElement("a")
  link.id = "admin-link"
  link.className = "admin-link"
  link.href = session ? "/admin.html" : adminLoginUrl()
  link.textContent = session ? "Kelola Arm Roll" : ""
  if (session) header.append(link)
}

refreshArmRolls()
updateAdminLink()
setInterval(refreshArmRolls, 15000)
window.addEventListener("load", () => map.invalidateSize())
