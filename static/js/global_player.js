document.addEventListener("DOMContentLoaded", function () {

  class Node {
    constructor(track) {
      this.track = track; // {id, title, artist, audio_url, cover_url}
      this.prev = null;
      this.next = null;
    }
  }

  class Stack {
    constructor(maxSize = 50) {
      this.items = [];
      this.maxSize = maxSize;
    }

    push(item) {
      this.items.push(item);
      if (this.items.length > this.maxSize) {
        this.items.shift();
      }
    }

    pop() {
      if (this.items.length === 0) return null;
      return this.items.pop();
    }

    peek() {
      if (this.items.length === 0) return null;
      return this.items[this.items.length - 1];
    }

    toArray() {
      return [...this.items].reverse();
    }

    isEmpty() {
      return this.items.length === 0;
    }
  }

  // ===================== HELPER KEY PER-USER =====================
  function getUserKey() {
    if (window.MyMusic && window.MyMusic.userKey != null) {
      return String(window.MyMusic.userKey);
    }
    return "anon";
  }

  function makeUserScopedKey(base) {
    return base + "_" + getUserKey();
  }

  // ===================== RIWAYAT PENCARIAN =====================
  const SEARCH_HISTORY_BASE_KEY = "mymusic_search_history_v1";
  let searchHistoryStack = new Stack(20);

  function getSearchHistoryKey() {
    return makeUserScopedKey(SEARCH_HISTORY_BASE_KEY);
  }

  function saveSearchHistory() {
    try {
      localStorage.setItem(
        getSearchHistoryKey(),
        JSON.stringify(searchHistoryStack.items)
      );
    } catch (e) {
      console.warn("Failed to save search history", e);
    }
  }

  function restoreSearchHistory() {
    try {
      const raw = localStorage.getItem(getSearchHistoryKey());
      if (!raw) return;
      const arr = JSON.parse(raw);
      searchHistoryStack.items = Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("Failed to restore search history", e);
    }
  }

  function clearSearchHistory() {
    searchHistoryStack.items = [];
    saveSearchHistory();

    if (typeof window.renderSearchHistorySection === "function") {
      window.renderSearchHistorySection();
    }
  }

  // ===================== RIWAYAT DENGAR LAGU =====================
  const LISTENING_HISTORY_BASE_KEY = "mymusic_listening_history_v1";
  let listeningHistoryStack = new Stack(30);

  function getListeningHistoryKey() {
    return makeUserScopedKey(LISTENING_HISTORY_BASE_KEY);
  }

  function saveListeningHistory() {
    try {
      const raw = JSON.stringify(listeningHistoryStack.items);
      localStorage.setItem(getListeningHistoryKey(), raw);
    } catch (e) {
      console.warn("Failed to save listening history", e);
    }
  }

  function restoreListeningHistory() {
    try {
      const raw = localStorage.getItem(getListeningHistoryKey());
      if (!raw) return;
      const arr = JSON.parse(raw);

      if (!Array.isArray(arr)) {
        listeningHistoryStack.items = [];
        return;
      }

      const seen = new Set();
      const deduped = [];

      // arr: lama → baru → iterasi mundur untuk ambil kemunculan terakhir
      for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];
        if (!item || item.id == null) continue;
        const key = String(item.id);
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(item);
      }

      deduped.reverse(); // balik lagi ke lama → baru
      listeningHistoryStack.items = deduped;
    } catch (e) {
      console.warn("Failed to restore listening history", e);
      listeningHistoryStack.items = [];
    }
  }

  function pushListeningHistory(track) {
    const payload = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover_url: track.cover_url || null,
      audio_url: track.audio_url || null,
    };

    listeningHistoryStack.items = listeningHistoryStack.items.filter(
      (item) => String(item.id) !== String(payload.id)
    );

    listeningHistoryStack.push(payload);
    saveListeningHistory();

    if (typeof window.renderListeningHistorySection === "function") {
      window.renderListeningHistorySection();
    }
  }

  // --- API kecil ke global (window) ---
  function addSearchQuery(query) {
    if (!query) return;
    const top = searchHistoryStack.peek();
    if (!top || top.query !== query) {
      searchHistoryStack.push({ query, ts: Date.now() });
      saveSearchHistory();

      if (typeof window.renderSearchHistorySection === "function") {
        window.renderSearchHistorySection();
      }
    }
  }

  function getSearchHistoryArray() {
    return searchHistoryStack.toArray();
  }

  function getListeningHistoryArray() {
    const arr = listeningHistoryStack.toArray(); // terbaru → terlama
    const seen = new Set();
    const result = [];

    for (const item of arr) {
      if (!item || item.id == null) continue;
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
    }

    return result;
  }


function removeSearchHistoryItem(ts) {
  if (ts == null) return;

  // hapus 1 item berdasarkan ts (unik per entry)
  const target = String(ts);
  searchHistoryStack.items = searchHistoryStack.items.filter(
    (item) => String(item && item.ts) !== target
  );

  saveSearchHistory();

  if (typeof window.renderSearchHistorySection === "function") {
    window.renderSearchHistorySection();
  }
}

window.MusicHistory = {
  addSearchQuery,
  getSearchHistory: getSearchHistoryArray,
  getListeningHistory: getListeningHistoryArray,
  clearSearchHistory,
  removeSearchHistoryItem,
};


  // ===================== DOUBLY LINKED LIST (QUEUE PLAYER) =====================
  class DoublyLinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
    }

    push(track) {
      const node = new Node(track);
      if (!this.head) {
        this.head = this.tail = node;
      } else {
        node.prev = this.tail;
        this.tail.next = node;
        this.tail = node;
      }
      return node;
    }

    clear() {
      this.head = this.tail = null;
    }

    toArray() {
      const arr = [];
      let cur = this.head;
      while (cur) {
        arr.push(cur.track);
        cur = cur.next;
      }
      return arr;
    }

    getNodeAt(index) {
      let cur = this.head;
      let i = 0;
      while (cur && i < index) {
        cur = cur.next;
        i++;
      }
      return cur || null;
    }

    indexOfNode(node) {
      let cur = this.head;
      let i = 0;
      while (cur) {
        if (cur === node) return i;
        cur = cur.next;
        i++;
      }
      return -1;
    }

    findNodeByTrackId(songId) {
      const target = String(songId);
      let cur = this.head;
      while (cur) {
        const t = cur.track;
        if (t && t.id != null && String(t.id) === target) return cur;
        cur = cur.next;
      }
      return null;
    }

    removeNode(node) {
      if (!node) return false;

      const prev = node.prev;
      const next = node.next;

      if (prev) prev.next = next;
      else this.head = next;

      if (next) next.prev = prev;
      else this.tail = prev;

      node.prev = null;
      node.next = null;
      return true;
    }
  }

  // ===================== GLOBAL PLAYER =====================
  const audio    = document.getElementById("globalAudio");
  const titleEl  = document.querySelector(".player__track-title");
  const artistEl = document.querySelector(".player__track-artist");
  const coverEl  = document.querySelector(".player__cover");

  const progressBar  = document.querySelector(".player__progress");
  const progressFill = document.querySelector(".player__progress-fill");
  const volumeBar    = document.querySelector(".player__volume");
  const volumeFill   = document.querySelector(".player__volume-fill");

  const btnLoop = document.getElementById("btnLoop");
  const btnPrev = document.getElementById("btnPrev");
  const btnPlay = document.getElementById("btnPlay");
  const btnNext = document.getElementById("btnNext");

  if (!audio) {
    // kalau halaman ini nggak punya player global, cukup keluar
    return;
  }

  if (typeof audio.volume !== "number" || isNaN(audio.volume)) {
    audio.volume = 0.7;
  }
  if (volumeFill) {
    volumeFill.style.width = `${audio.volume * 100}%`;
  }

  const PLAYER_STATE_BASE_KEY = "mymusic_player_state_v1";
  function getPlayerStateKey() {
    return makeUserScopedKey(PLAYER_STATE_BASE_KEY);
  }

  const queue = new DoublyLinkedList();
  let currentNode = null;
  let loopMode = "none"; // "none" | "one" | "all"

  // ===================== MISSING HELPERS (FIX) =====================
  function isPlayableTrack(track) {
    return !!(track && track.audio_url);
  }

  function getNextValidNode(startNode, direction) {
    let cur = startNode || null;
    const dir = direction === "prev" ? "prev" : "next";

    while (cur) {
      if (cur.track && isPlayableTrack(cur.track)) return cur;
      cur = cur[dir];
    }
    return null;
  }

  // ===================== HELPERS =====================
  function setUI(track) {
    if (!track) return;
    if (titleEl)  titleEl.textContent  = track.title || "Song title";
    if (artistEl) artistEl.textContent = track.artist || "Artist name";

    if (coverEl) {
      if (track.cover_url) {
        coverEl.style.backgroundImage = `url('${track.cover_url}')`;
      } else {
        coverEl.style.backgroundImage = "";
      }
    }
  }

  function updatePlayIcon() {
    if (!btnPlay) return;
    btnPlay.textContent = audio.paused ? "▶" : "⏸";
  }

  function serializeState() {
    const tracks = queue.toArray();
    let currentIndex = -1;

    if (currentNode) {
      currentIndex = queue.indexOfNode(currentNode);
    }

    return {
      tracks,
      currentIndex,
      position: audio.currentTime || 0,
      playing: !audio.paused,
      loopMode,
      volume: audio.volume,
    };
  }

  function updateLoopButtonUI() {
    if (!btnLoop) return;

    btnLoop.classList.toggle("player__btn--loop-active", loopMode !== "none");

    if (loopMode === "one") {
      btnLoop.textContent = "1";
    } else {
      btnLoop.textContent = "⟲";
    }
  }

  function saveState() {
    try {
      const st = serializeState();
      localStorage.setItem(getPlayerStateKey(), JSON.stringify(st));
    } catch (e) {
      console.warn("Failed to save player state", e);
    }
  }

  function rebuildFromState(st) {
    if (!st || !Array.isArray(st.tracks)) return;

    queue.clear();
    currentNode = null;

    st.tracks.forEach((t, idx) => {
      const node = queue.push(t);
      if (idx === st.currentIndex) {
        currentNode = node;
      }
    });

    loopMode = st.loopMode || "none";
    updateLoopButtonUI();

    if (typeof st.volume === "number") {
      audio.volume = Math.min(Math.max(st.volume, 0), 1);
    } else {
      audio.volume = 0.7;
    }
    if (volumeFill) {
      volumeFill.style.width = `${audio.volume * 100}%`;
    }

    if (currentNode) {
      const t = currentNode.track;
      audio.src = t.audio_url || "";

      try {
        audio.currentTime = st.position || 0;
      } catch (_) {}

      setUI(t);

      if (st.playing && audio.src) {
        audio.play().then(updatePlayIcon).catch(() => {});
      } else {
        updatePlayIcon();
      }
    }
  }

  function playNode(node, opts = {}) {
    if (!node) return;
    currentNode = node;

    const t = node.track;
    if (!t || !t.audio_url) return;

    const resumeTime =
      typeof opts.resumeTime === "number" && opts.resumeTime > 0
        ? opts.resumeTime
        : 0;
    const autoplay = opts.autoplay !== false; // default: true

    audio.src = t.audio_url;

    try {
      audio.currentTime = resumeTime;
    } catch (_) {}

    setUI(t);

    if (autoplay) {
      audio
        .play()
        .then(() => {
          updatePlayIcon();
          saveState();
        })
        .catch((e) => {
          console.error("Failed to play track:", e);
        });
    } else {
      audio.pause();
      updatePlayIcon();
      saveState();
    }

    pushListeningHistory(t);
  }

  function loadQueueFromTracks(tracks, startIndex = 0, opts = {}) {
    queue.clear();
    currentNode = null;

    tracks.forEach((t, idx) => {
      const node = queue.push(t);
      if (idx === startIndex) currentNode = node;
    });

    if (!currentNode && queue.head) {
      currentNode = queue.head;
    }

    if (currentNode) {
      // terusin opsi (autoplay + resumeTime) dari playlist
      playNode(currentNode, opts);
    } else {
      saveState();
    }
  }

  function setLoop(mode) {
    loopMode = mode;
    updateLoopButtonUI();
    saveState();
  }

  function toggleLoopMode() {
    if (loopMode === "none") {
      setLoop("all");
    } else if (loopMode === "all") {
      setLoop("one");
    } else {
      setLoop("none");
    }
  }

  function playNext() {
    if (!currentNode) return;

    if (loopMode === "one") {
      playNode(currentNode);
      return;
    }

    const candidate = getNextValidNode(currentNode.next, "next");

    if (candidate) {
      playNode(candidate);
    } else if (loopMode === "all" && queue.head) {
      const headValid = getNextValidNode(queue.head, "next");
      if (headValid) playNode(headValid);
      else {
        audio.pause();
        audio.currentTime = 0;
        updatePlayIcon();
        saveState();
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      updatePlayIcon();
      saveState();
    }
  }

  function playPrev() {
    if (!currentNode) return;

    if (audio.currentTime > 3) {
      playNode(currentNode);
      return;
    }

    // ambil node prev yang valid (skip yang kosong)
    const candidate = getNextValidNode(currentNode.prev, "prev");

    if (candidate) {
      playNode(candidate);
    } else if (loopMode === "all" && queue.tail) {
      // wrap ke tail, tapi pastikan tail valid juga
      const tailValid = getNextValidNode(queue.tail, "prev");
      if (tailValid) playNode(tailValid);
    }
  }

  function togglePlay() {
    if (!audio.src) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          updatePlayIcon();
          saveState();
        })
        .catch(console.error);
    } else {
      audio.pause();
      updatePlayIcon();
      saveState();
    }
  }

  // ===================== EVENT BINDING =====================
  if (btnLoop) {
    btnLoop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLoopMode();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      playPrev();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      playNext();
    });
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration || !progressFill) return;
    const ratio = audio.currentTime / audio.duration;
    progressFill.style.width = `${ratio * 100}%`;

    if (Math.floor(audio.currentTime) % 3 === 0) {
      saveState();
    }
  });

  audio.addEventListener("play", () => {
    updatePlayIcon();
    saveState();
  });

  audio.addEventListener("pause", () => {
    updatePlayIcon();
    saveState();
  });

  audio.addEventListener("ended", () => {
    if (loopMode === "one") {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    playNext();
  });

  window.addEventListener("beforeunload", saveState);

  // ===================== PROGRESS & VOLUME BAR INTERAKTIF =====================
  let isSeeking = false;
  let isAdjustingVolume = false;

  function seekFromEvent(e) {
    if (!audio.duration || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(offsetX / rect.width, 0), 1);

    audio.currentTime = ratio * audio.duration;

    if (progressFill) {
      progressFill.style.width = `${ratio * 100}%`;
    }
  }

  function setVolumeFromEvent(e) {
    if (!volumeBar) return;

    const rect = volumeBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    let ratio = offsetX / rect.width;

    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    audio.volume = ratio;
    if (volumeFill) {
      volumeFill.style.width = `${ratio * 100}%`;
    }

    saveState();
  }

  if (progressBar) {
    progressBar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      seekFromEvent(e);
      saveState();
    });

    progressBar.addEventListener("mousedown", (e) => {
      isSeeking = true;
      seekFromEvent(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (!isSeeking) return;
      seekFromEvent(e);
    });

    document.addEventListener("mouseup", () => {
      if (!isSeeking) return;
      isSeeking = false;
      saveState();
    });
  }

  if (volumeBar) {
    volumeBar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setVolumeFromEvent(e);
    });

    volumeBar.addEventListener("mousedown", (e) => {
      isAdjustingVolume = true;
      setVolumeFromEvent(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (!isAdjustingVolume) return;
      setVolumeFromEvent(e);
    });

    document.addEventListener("mouseup", () => {
      isAdjustingVolume = false;
    });
  }

  function getCurrentInfo() {
    if (!currentNode || !currentNode.track) return null;
    const t = currentNode.track;
    const idx = queue.indexOfNode(currentNode);

    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      index: idx,
      position: audio.currentTime || 0,
      playing: !audio.paused,
    };
  }

  // ===================== EXPOSE KE GLOBAL =====================
  window.AppPlayer = {
    playPlaylist(tracks, startIndex = 0, opts = {}) {
      if (!Array.isArray(tracks) || tracks.length === 0) return;
      loadQueueFromTracks(tracks, startIndex, opts || {});
    },

    playSingle(track) {
      if (!track || !track.audio_url) return;
      loadQueueFromTracks([track], 0, { autoplay: true, resumeTime: 0 });
    },

    removeFromQueueById(songId) {
      const node = queue.findNodeByTrackId(songId);
      if (!node) return false;

      const wasCurrent = (node === currentNode);
      const wasPlaying = !audio.paused;

      // tentukan pengganti kalau yang dihapus adalah current
      let replacement = null;
      if (wasCurrent) {
        replacement =
          getNextValidNode(node.next, "next") ||
          getNextValidNode(node.prev, "prev");
      }

      // hapus node dari linked list
      queue.removeNode(node);

      if (wasCurrent) {
        currentNode = replacement;
        if (currentNode && isPlayableTrack(currentNode.track)) {
          playNode(currentNode, { autoplay: wasPlaying, resumeTime: 0 });
        } else {
          // queue habis
          currentNode = null;
          audio.pause();
          audio.currentTime = 0;
          audio.src = "";
          updatePlayIcon();
          saveState();
        }
      } else {
        // kalau bukan current, cukup save state supaya index/queue keupdate
        saveState();
      }

      return true;
    },

    setLoopMode(mode) {
      setLoop(mode);
    },
    next: playNext,
    prev: playPrev,
    togglePlay,
    getCurrentInfo,
  };

  // ===================== INIT DARI localStorage =====================
  restoreSearchHistory();
  restoreListeningHistory();

  if (typeof window.renderSearchHistorySection === "function") {
    window.renderSearchHistorySection();
  }

  if (typeof window.renderListeningHistorySection === "function") {
    window.renderListeningHistorySection();
  }

  try {
    const raw = localStorage.getItem(getPlayerStateKey());
    if (raw) {
      const st = JSON.parse(raw);
      rebuildFromState(st);
    } else {
      updatePlayIcon();
    }
  } catch (e) {
    console.warn("Failed to restore player state", e);
  }

  // pastikan ikon loop konsisten untuk user baru / tanpa state
  updateLoopButtonUI();
});
