document.addEventListener("DOMContentLoaded", function () {


  class Node {
    constructor(track) {
      this.track = track; // {id, title, artist, audio_url, cover_url}
      this.prev = null;
      this.next = null;
    }
  }

  
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

  // ============= STACK =================

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

    // dedupe by id (keep latest)
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

  if (!audio) return;

  // prevent double init if this script is injected twice (SPA-ish)
  if (audio.dataset.gpInit === "1") return;
  audio.dataset.gpInit = "1";

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

  // ===================== HELPERS =====================
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

  function updateLoopButtonUI() {
    if (!btnLoop) return;

    // active only for all/one
    btnLoop.classList.toggle("player__btn--loop-active", loopMode !== "none");

    // use glyph that usually exists across fonts
    if (loopMode === "one") btnLoop.textContent = "↻1";
    else btnLoop.textContent = "↻";
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

  function _readPlayerStateRaw() {
    const currentKey = getPlayerStateKey();
    const keysToTry = [
      currentKey,
      PLAYER_STATE_BASE_KEY + "_anon", // fallback if some pages missed userKey
      PLAYER_STATE_BASE_KEY,           // legacy
    ];

    for (const k of keysToTry) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) return { raw, key: k, currentKey };
      } catch (_) {}
    }
    return { raw: null, key: null, currentKey };
  }

  function saveState() {
    try {
      const st = serializeState();
      const raw = JSON.stringify(st);
      localStorage.setItem(getPlayerStateKey(), raw);
    } catch (e) {
      console.warn("Failed to save player state", e);
    }
  }

  // throttle saveState on timeupdate
  let _lastSavedSecond = -1;

  function _maybeSaveOnTimeUpdate() {
    const sec = Math.floor(audio.currentTime || 0);
    if (sec <= 0) return;

    // every 3 seconds, but only once per second tick
    if (sec % 3 === 0 && sec !== _lastSavedSecond) {
      _lastSavedSecond = sec;
      saveState();
    }
  }

  function _safeSetCurrentTime(seconds) {
    const target = Number(seconds) || 0;

    // attempt immediately
    try {
      audio.currentTime = target;
      return;
    } catch (_) {}

    // fallback once metadata is ready
    const once = () => {
      audio.removeEventListener("loadedmetadata", once);
      try { audio.currentTime = target; } catch (_) {}
    };
    audio.addEventListener("loadedmetadata", once);
  }

  function rebuildFromState(st) {
    if (!st || !Array.isArray(st.tracks)) return;

    queue.clear();
    currentNode = null;

    st.tracks.forEach((t, idx) => {
      const node = queue.push(t);
      if (idx === st.currentIndex) currentNode = node;
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
      if (t && t.audio_url) {
        audio.pause();
        audio.src = t.audio_url || "";
        audio.load();

        _safeSetCurrentTime(st.position || 0);
        setUI(t);

        if (st.playing && audio.src) {
          audio.play().then(updatePlayIcon).catch(() => updatePlayIcon());
        } else {
          updatePlayIcon();
        }
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

    audio.pause();
    audio.src = t.audio_url;
    audio.load();

    _safeSetCurrentTime(resumeTime);
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
          updatePlayIcon();
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

    if (!currentNode && queue.head) currentNode = queue.head;

    if (currentNode) playNode(currentNode, opts);
    else saveState();
  }

  function setLoop(mode) {
    loopMode = mode;
    updateLoopButtonUI();
    saveState();
  }

  function toggleLoopMode() {
    if (loopMode === "none") setLoop("all");
    else if (loopMode === "all") setLoop("one");
    else setLoop("none");
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

    const candidate = getNextValidNode(currentNode.prev, "prev");

    if (candidate) {
      playNode(candidate);
    } else if (loopMode === "all" && queue.tail) {
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
        .catch((e) => {
          console.error(e);
          updatePlayIcon();
        });
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
    _maybeSaveOnTimeUpdate();
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

  // extra local state (does not rename existing vars)
  let wasPlayingBeforeSeek = false;

  function _getClientX(e) {
    if (!e) return 0;
    if (e.touches && e.touches[0]) return e.touches[0].clientX;
    if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
    return e.clientX;
  }

  function seekFromEvent(e) {
    if (!audio.duration || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = _getClientX(e) - rect.left;
    const ratio = Math.min(Math.max(offsetX / rect.width, 0), 1);

    audio.currentTime = ratio * audio.duration;

    if (progressFill) {
      progressFill.style.width = `${ratio * 100}%`;
    }
  }

  function setVolumeFromEvent(e) {
    if (!volumeBar) return;

    const rect = volumeBar.getBoundingClientRect();
    const offsetX = _getClientX(e) - rect.left;
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
    // Click seek: pause briefly to avoid glitch/echo on some browsers
    progressBar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const wasPlaying = !audio.paused;
      if (wasPlaying) audio.pause();

      seekFromEvent(e);

      if (wasPlaying) audio.play().catch(() => {});
      saveState();
    });

    progressBar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      wasPlayingBeforeSeek = !audio.paused;
      audio.pause(); // critical: stop while dragging to prevent “echo”
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

      if (wasPlayingBeforeSeek) {
        audio.play().catch(() => {});
      }
      saveState();
    });

    // touch support
    progressBar.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();

      wasPlayingBeforeSeek = !audio.paused;
      audio.pause();
      isSeeking = true;
      seekFromEvent(e);
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
      if (!isSeeking) return;
      seekFromEvent(e);
    }, { passive: false });

    document.addEventListener("touchend", () => {
      if (!isSeeking) return;
      isSeeking = false;

      if (wasPlayingBeforeSeek) {
        audio.play().catch(() => {});
      }
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
      e.preventDefault();
      e.stopPropagation();
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

    // touch support
    volumeBar.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isAdjustingVolume = true;
      setVolumeFromEvent(e);
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
      if (!isAdjustingVolume) return;
      setVolumeFromEvent(e);
    }, { passive: false });

    document.addEventListener("touchend", () => {
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

      let replacement = null;
      if (wasCurrent) {
        replacement =
          getNextValidNode(node.next, "next") ||
          getNextValidNode(node.prev, "prev");
      }

      queue.removeNode(node);

      if (wasCurrent) {
        currentNode = replacement;

        if (currentNode && isPlayableTrack(currentNode.track)) {
          playNode(currentNode, { autoplay: wasPlaying, resumeTime: 0 });
        } else {
          currentNode = null;
          audio.pause();
          audio.currentTime = 0;
          audio.src = "";
          updatePlayIcon();
          saveState();
        }
      } else {
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

  // restore player state with fallback keys, then migrate to current key
  try {
    const { raw, key, currentKey } = _readPlayerStateRaw();
    if (raw) {
      const st = JSON.parse(raw);
      rebuildFromState(st);

      // migrate to current scoped key if it came from fallback
      if (key && currentKey && key !== currentKey) {
        try { localStorage.setItem(currentKey, raw); } catch (_) {}
      }
    } else {
      updatePlayIcon();
    }
  } catch (e) {
    console.warn("Failed to restore player state", e);
    updatePlayIcon();
  }

  updateLoopButtonUI();
});