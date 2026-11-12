# 🛠️ Panduan Lengkap: Cara Mengakses Server Kubernetes dari Editor Lain (VS Code, Cursor, JetBrains, Lens)

Dokumentasi ini menjelaskan langkah demi langkah bagaimana Anda dapat menghubungkan dan mengelola cluster Kubernetes di VPS **`103.172.205.41`** menggunakan editor modern seperti **VS Code, Cursor, Windsurf, JetBrains**, maupun tool devops seperti **Lens, k9s, atau terminal lokal**.

---

## 🔑 Informasi Kredensial Server VPS

* **IP VPS Master:** `103.172.205.41`
* **SSH Port:** `22`
* **Username:** `tovan`
* **Password:** `T0v4n.kamil`
* **SSH Private Key (Lokal):** `~/.ssh/id_ed25519`
* **Kubeconfig Path (di VPS):** `/home/tovan/.kube/config` atau `/etc/kubernetes/admin.conf`

---

## Metoda 1: Akses Remote Code & Terminal via VS Code / Cursor / Windsurf (Remote - SSH)

Metode ini memungkinkan Anda membuka folder proyek di server VPS seolah-olah file tersebut berada di komputer lokal Anda, lengkap dengan terminal langsung di dalam editor.

### 1. Install Extension Remote - SSH
Buka VS Code atau Cursor:
1. Tekan `Ctrl + Shift + X` (Extensions).
2. Cari dan install ekstensi: **Remote - SSH** (oleh Microsoft).

### 2. Konfigurasi SSH Config Lokal
Buka file `~/.ssh/config` di komputer lokal Anda (atau jalankan `code ~/.ssh/config`), lalu tambahkan baris berikut:

```ssh
Host synetiq-k8s
    HostName 103.172.205.41
    User tovan
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
```

### 3. Hubungkan Editor ke Server
1. Tekan tombol `F1` atau `Ctrl + Shift + P`.
2. Ketik dan pilih: **`Remote-SSH: Connect to Host...`**
3. Pilih **`synetiq-k8s`**.
4. Jendela baru editor akan terbuka dan terhubung langsung ke VPS.
5. Pilih menu **File > Open Folder** dan arahkan ke `/home/tovan` atau direktori proyek.

> [!TIP]
> Di terminal bawaan VS Code/Cursor yang sudah terhubung, Anda bisa langsung menjalankan perintah `kubectl get pods -A`, `kubectl logs`, dan mengedit konfigurasi cluster tanpa perlu membuka aplikasi PuTTY atau SSH terpisah!

---

## Metoda 2: Kelola Kubernetes GUI via Ekstensi VS Code / Cursor

Jika Anda ingin melihat daftar Pod, Service, Deployment, dan Logs langsung di sidebar VS Code/Cursor:

1. Di VS Code / Cursor, install ekstensi: **Kubernetes** (oleh Microsoft).
2. Di remote session VPS, ekstensi akan otomatis membaca file `/home/tovan/.kube/config`.
3. Anda akan melihat pohon navigasi cluster di sidebar kiri:
   * **Workloads > Deployments**: Klik kanan untuk melihat logs atau restart pod.
   * **Network > Services**: Melihat port publik dan status service.
   * **Nodes**: Memantau kapasitas CPU dan Memori node master dan worker.

---

## Metoda 3: Menggunakan kubectl Lokal / Lens / k9s dari Laptop Anda

Jika Anda ingin menjalankan `kubectl` langsung dari PowerShell / CMD laptop Anda tanpa perlu SSH:

### 1. Salin Kubeconfig dari VPS ke Laptop
Jalankan perintah ini di PowerShell laptop Anda:

```powershell
scp tovan@103.172.205.41:/etc/kubernetes/admin.conf $HOME\.kube\config-synetiq
```
*(Masukkan password `T0v4n.kamil` jika diminta)*

### 2. Sesuaikan Server IP di File Kubeconfig
Buka file `$HOME\.kube\config-synetiq` dengan editor teks, cari bagian `server:`:
```yaml
clusters:
- cluster:
    server: https://103.172.205.41:6443
```
Pastikan IP mengarah ke `https://103.172.205.41:6443`.

### 3. Gunakan di Tool Favorit:
* **Terminal Lokal:**
  ```powershell
  kubectl --kubeconfig $HOME\.kube\config-synetiq get pods -n synetiq
  ```
* **Lens IDE Desktop:**
  Buka Lens Desktop > *Add Cluster* > *Paste kubeconfig* atau pilih file `$HOME\.kube\config-synetiq`.
* **k9s (Terminal UI):**
  ```powershell
  k9s --kubeconfig $HOME\.kube\config-synetiq
  ```

---

## Metoda 4: Web Dashboard & Copilot AI (Browser)

Jika tidak ingin membuka editor, Anda selalu dapat mengontrol cluster secara visual:

* **URL Dashboard:** [http://103.172.205.41:8080](http://103.172.205.41:8080)
* **Fitur:**
  * Status real-time Pods, Deployments, Nodes, dan Services.
  * Web CLI Runner untuk menjalankan command langsung.
  * AI Copilot (Gemini) untuk troubleshooting dan perbaikan otomatis sekali ketik.

