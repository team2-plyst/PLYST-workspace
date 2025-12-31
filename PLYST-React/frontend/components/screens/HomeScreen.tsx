import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Bell, User, Music2, TrendingUp, Clock, Heart, Share2, MessageCircle, Play, ChevronDown, ChevronUp, Send, Loader2, Plus, Sparkles } from "lucide-react";
import { Input } from "../ui/input";
import MusicPlayer from "../MusicPlayer";
import SearchPlaylistModal from "../SearchPlaylistModal";
import CreatePlaylistModal from "../CreatePlaylistModal";
import AIRecommendModal from "../AIRecommendModal";
import ProfileModal from "../ProfileModal";
import NotificationModal from "../NotificationModal";
import { Track, getYoutubeVideoId, getTrackInfo } from "../../services/api";

const imgBackground = "/background.jpg";

interface CurrentTrack {
  track: Track;
  videoId: string;
}

interface PlaylistPost {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  title: string;
  description: string;
  coverGradient: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  createdAt: string;
  tracks: {
    id: number;
    title: string;
    artist: string;
    duration: string;
    albumImage?: string;
  }[];
}

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface RecentlyPlayedTrack {
  id: string;
  title: string;
  artist: string;
  albumImage?: string;
  duration: string;
  playedAt: Date;
  isLiked: boolean;
}

// 재생 대기열 인터페이스
interface PlayQueue {
  tracks: { title: string; artist: string; albumImage?: string; duration?: string }[];
  currentIndex: number;
  originalTracks?: { title: string; artist: string; albumImage?: string; duration?: string }[]; // 셔플 전 원본
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "recent" | "liked">("trending");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [playQueue, setPlayQueue] = useState<PlayQueue | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [likedTracks, setLikedTracks] = useState<Set<string>>(() => {
    // localStorage에서 좋아요한 트랙 목록 불러오기
    const saved = localStorage.getItem("likedTracks");
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [trackAlbumImages, setTrackAlbumImages] = useState<Record<string, string>>({});
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAIRecommendOpen, setIsAIRecommendOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [aiRecommendedPlaylists, setAIRecommendedPlaylists] = useState<PlaylistPost[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>(() => {
    // localStorage에서 최근 재생 기록 불러오기
    const saved = localStorage.getItem("recentlyPlayed");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: RecentlyPlayedTrack) => ({
          ...item,
          playedAt: new Date(item.playedAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [playlistPosts, setPlaylistPosts] = useState<PlaylistPost[]>([
    {
      id: 1,
      author: { name: "음악러버", avatar: "🎵" },
      title: "비 오는 날 듣기 좋은 감성 플리 🌧️",
      description: "비가 오는 날, 커피 한 잔과 함께 들으면 좋은 감성적인 곡들을 모았습니다.",
      coverGradient: "from-blue-500 to-indigo-600",
      tags: ["감성", "비오는날", "카페", "힌링"],
      likes: 234,
      shares: 45,
      isLiked: false,
      createdAt: "2시간 전",
      tracks: [
        { id: 1, title: "비가 오는 날엔", artist: "헤이즈", duration: "3:42" },
        { id: 2, title: "비도 오고 그래서", artist: "헤이즈", duration: "4:15" },
        { id: 3, title: "Rain", artist: "태연", duration: "3:58" },
        { id: 4, title: "밤편지", artist: "아이유", duration: "4:30" },
        { id: 5, title: "우산", artist: "윤하", duration: "3:25" },
      ],
      comments: [
        { id: 1, author: "뮤직팬", content: "비 오는 날 최고의 플리네요! 💙", createdAt: "1시간 전" },
        { id: 2, author: "음악좋아", content: "밤편지 진짜 좋아요", createdAt: "30분 전" },
      ],
    },
    {
      id: 2,
      author: { name: "새벽감성", avatar: "🌙" },
      title: "새벽에 혼자 듣는 플레이리스트 ✨",
      description: "잠이 안 올 때, 혼자만의 시간을 보내고 싶을 때 추천하는 곡들입니다.",
      coverGradient: "from-purple-600 to-pink-500",
      tags: ["새벽", "밤", "감성", "잔잔한"],
      likes: 567,
      shares: 89,
      isLiked: true,
      createdAt: "5시간 전",
      tracks: [
        { id: 1, title: "밤양갱", artist: "빅나티", duration: "3:12" },
        { id: 2, title: "Love wins all", artist: "아이유", duration: "3:45" },
        { id: 3, title: "Super Shy", artist: "뉴진스", duration: "2:58" },
        { id: 4, title: "Ditto", artist: "뉴진스", duration: "3:10" },
      ],
      comments: [
        { id: 1, author: "야행성", content: "제 새벽 필수 플리가 됐어요!", createdAt: "3시간 전" },
      ],
    },
    {
      id: 3,
      author: { name: "운동마니아", avatar: "💪" },
      title: "운동할 때 텐션 올려주는 플리 🔥",
      description: "헬스장에서 운동할 때 듣기 좋은 신나는 곡들 모음!",
      coverGradient: "from-orange-500 to-red-600",
      tags: ["운동", "헬스", "신나는", "테션업"],
      likes: 891,
      shares: 156,
      isLiked: false,
      createdAt: "1일 전",
      tracks: [
        { id: 1, title: "FLOWER", artist: "지수", duration: "3:05" },
        { id: 2, title: "Dynamite", artist: "BTS", duration: "3:19" },
        { id: 3, title: "How You Like That", artist: "BLACKPINK", duration: "3:02" },
        { id: 4, title: "ANTIFRAGILE", artist: "르세라핌", duration: "2:56" },
        { id: 5, title: "Hype Boy", artist: "뉴진스", duration: "2:58" },
        { id: 6, title: "Get A Guitar", artist: "리제", duration: "2:42" },
      ],
      comments: [],
    },
  ]);

  // 최근 재생 기록을 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // 최근 재생 기록에 곡 추가
  const addToRecentlyPlayed = (track: { title: string; artist: string; albumImage?: string; duration?: string }) => {
    const newTrack: RecentlyPlayedTrack = {
      id: `${track.title}-${track.artist}-${Date.now()}`,
      title: track.title,
      artist: track.artist,
      albumImage: track.albumImage || "",
      duration: track.duration || "0:00",
      playedAt: new Date(),
      isLiked: false,
    };

    setRecentlyPlayed(prev => {
      // 같은 곡이 이미 있으면 제거 (최상단에 다시 추가하기 위해)
      const filtered = prev.filter(
        item => !(item.title === track.title && item.artist === track.artist)
      );
      // 최대 50개까지만 저장
      return [newTrack, ...filtered].slice(0, 50);
    });
  };

  const handleLikePlaylist = (postId: number) => {
    setPlaylistPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;
    
    setPlaylistPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                { id: Date.now(), author: "나", content: newComment, createdAt: "방금 전" },
              ],
            }
          : post
      )
    );
    setNewComment("");
  };

  const handleShare = (post: PlaylistPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${post.title} - ${window.location.href}`);
      alert("링크가 복사되었습니다!");
    }
  };

  // 플레이리스트가 펼쳐지면 트랙들의 앨범 이미지 가져오기
  useEffect(() => {
    if (expandedPlaylist === null) return;
    
    const post = playlistPosts.find(p => p.id === expandedPlaylist);
    if (!post) return;

    const fetchAlbumImages = async () => {
      for (const track of post.tracks) {
        const trackKey = `${track.title}-${track.artist}`;
        if (trackAlbumImages[trackKey]) continue; // 이미 로드됨
        
        try {
          const info = await getTrackInfo(track.title, track.artist);
          if (info?.albumImage) {
            setTrackAlbumImages(prev => ({
              ...prev,
              [trackKey]: info.albumImage
            }));
          }
        } catch (error) {
          console.error('앨범 이미지 가져오기 오류:', error);
        }
      }
    };

    fetchAlbumImages();
  }, [expandedPlaylist, playlistPosts]);

  // 플레이리스트에서 특정 트랙 재생 (재생 대기열 설정)
  const handlePlayTrackFromPlaylist = async (
    trackIndex: number,
    playlistTracks: { title: string; artist: string; albumImage?: string; duration?: string }[]
  ) => {
    const track = playlistTracks[trackIndex];
    const trackKey = `${track.title}-${track.artist}`;
    if (loadingTrack === trackKey) return;
    
    setLoadingTrack(trackKey);
    try {
      const videoId = await getYoutubeVideoId(track.title, track.artist);
      if (videoId) {
        const trackData: Track = {
          title: track.title,
          artists: track.artist,
          album: {
            title: "플레이리스트",
            image: track.albumImage || "",
          },
        };
        setCurrentTrack({ track: trackData, videoId });
        setPlayQueue({ tracks: playlistTracks, currentIndex: trackIndex });
        
        // 최근 재생 기록에 추가
        addToRecentlyPlayed(track);
      } else {
        alert("해당 곡을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("트랙 재생 오류:", error);
      alert("재생 중 오류가 발생했습니다.");
    } finally {
      setLoadingTrack(null);
    }
  };

  const handlePlayTrack = async (title: string, artist: string, albumImage?: string, duration?: string) => {
    const trackKey = `${title}-${artist}`;
    if (loadingTrack === trackKey) return;
    
    setLoadingTrack(trackKey);
    try {
      const videoId = await getYoutubeVideoId(title, artist);
      if (videoId) {
        const track: Track = {
          title,
          artists: artist,
          album: {
            title: "플레이리스트",
            image: albumImage || "",
          },
        };
        setCurrentTrack({ track, videoId });
        // 단일 트랙 재생 시 재생 대기열 초기화
        setPlayQueue(null);
        
        // 최근 재생 기록에 추가
        addToRecentlyPlayed({ title, artist, albumImage, duration });
      } else {
        alert("해당 곡을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("트랙 재생 오류:", error);
      alert("재생 중 오류가 발생했습니다.");
    } finally {
      setLoadingTrack(null);
    }
  };

  // 이전 트랙 재생
  const handlePreviousTrack = async () => {
    if (!playQueue || playQueue.currentIndex <= 0) return;
    const newIndex = playQueue.currentIndex - 1;
    await handlePlayTrackFromPlaylist(newIndex, playQueue.tracks);
  };

  // 다음 트랙 재생
  const handleNextTrack = async () => {
    if (!playQueue || playQueue.currentIndex >= playQueue.tracks.length - 1) return;
    const newIndex = playQueue.currentIndex + 1;
    await handlePlayTrackFromPlaylist(newIndex, playQueue.tracks);
  };

  // 트랙 종료 시 호출 (다음 곡 자동 재생)
  const handleTrackEnd = async () => {
    if (!playQueue) return;
    
    const isLastTrack = playQueue.currentIndex >= playQueue.tracks.length - 1;
    
    if (isLastTrack) {
      // 마지막 곡일 때
      if (repeatMode === "all") {
        // 전체 반복: 첫 곡으로 돌아가기
        await handlePlayTrackFromPlaylist(0, playQueue.tracks);
      }
      // repeatMode가 "off"면 아무것도 하지 않음 (곡 종료)
    } else {
      // 다음 곡이 있으면 자동 재생
      await handleNextTrack();
    }
  };

  // 셔플 토글
  const handleShuffleToggle = () => {
    if (!playQueue) {
      setIsShuffle(!isShuffle);
      return;
    }

    if (!isShuffle) {
      // 셔플 ON: 현재 트랙을 제외한 나머지를 섞고 현재 트랙을 맨 앞에 배치
      const currentTrackData = playQueue.tracks[playQueue.currentIndex];
      const otherTracks = playQueue.tracks.filter((_, i) => i !== playQueue.currentIndex);
      
      // Fisher-Yates 셔플
      for (let i = otherTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
      }
      
      const shuffledTracks = [currentTrackData, ...otherTracks];
      setPlayQueue({
        tracks: shuffledTracks,
        currentIndex: 0,
        originalTracks: playQueue.originalTracks || playQueue.tracks,
      });
    } else {
      // 셔플 OFF: 원본 순서로 복원
      if (playQueue.originalTracks) {
        const currentTrackData = playQueue.tracks[playQueue.currentIndex];
        const originalIndex = playQueue.originalTracks.findIndex(
          t => t.title === currentTrackData.title && t.artist === currentTrackData.artist
        );
        setPlayQueue({
          tracks: playQueue.originalTracks,
          currentIndex: originalIndex >= 0 ? originalIndex : 0,
          originalTracks: undefined,
        });
      }
    }
    setIsShuffle(!isShuffle);
  };

  // 반복 모드 토글
  const handleRepeatToggle = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  // 좋아요 토글
  const handleLikeToggle = () => {
    if (!currentTrack) return;
    const trackKey = `${currentTrack.track.title}-${currentTrack.track.artists}`;
    
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackKey)) {
        newSet.delete(trackKey);
      } else {
        newSet.add(trackKey);
      }
      // localStorage에 저장
      localStorage.setItem("likedTracks", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // 현재 트랙이 좋아요 상태인지 확인
  const isCurrentTrackLiked = currentTrack 
    ? likedTracks.has(`${currentTrack.track.title}-${currentTrack.track.artists}`)
    : false;

  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url('${imgBackground}')`,
      }}
    >
      {/* Top Header - Glassy */}
      <header className="flex items-center justify-between p-4 backdrop-blur-xl bg-black/20 border-b border-white/10">
        {/* Left: Logo/Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-2">
            <Music2 className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-white text-xl hidden sm:block">PLYST</h1>
        </motion.div>

        {/* Center: Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 max-w-md mx-4"
        >
          <div 
            className="relative cursor-pointer"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              type="text"
              placeholder="플레이리스트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setIsSearchModalOpen(true)}
              readOnly
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 cursor-pointer"
            />
          </div>
        </motion.div>

        {/* Right: Notification, Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-white" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section - Glassy Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 md:p-8 mb-6 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-white text-3xl mb-2">환영합니다! 👋</h2>
                <p className="text-white/70">오늘도 좋은 음악과 함께하세요</p>
              </div>
              <div className="flex gap-2">
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl px-4 py-2">
                  <p className="text-white/60 text-xs">재생 시간</p>
                  <p className="text-white">2시간 34분</p>
                </div>
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl px-4 py-2">
                  <p className="text-white/60 text-xs">좋아요</p>
                  <p className="text-white">156곡</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          >
            {[
              { title: "인기 플레이리스트", desc: "지금 가장 인기있는 플레이리스트", icon: TrendingUp, color: "from-purple-500 to-pink-500", action: () => setActiveTab("trending") },
              { title: "최근 재생", desc: "최근에 들은 음악", icon: Clock, color: "from-blue-500 to-cyan-500", action: () => setActiveTab("recent") },
              { title: "좋아요 목록", desc: "당신이 좋아한 음악", icon: Heart, color: "from-rose-500 to-orange-500", action: () => setActiveTab("liked") },
            ].map((item, i) => (
              <div
                key={i}
                onClick={item.action}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                {/* Icon */}
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white text-xl mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Playlist Creation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <button 
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="group flex items-center gap-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-2xl px-5 py-3 transition-all"
            >
              <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">플레이리스트 만들기</p>
                <p className="text-white/50 text-xs">나만의 플레이리스트 생성</p>
              </div>
            </button>
            
            <button 
              onClick={() => setIsAIRecommendOpen(true)}
              className="group flex items-center gap-3 backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 hover:border-purple-400/50 rounded-2xl px-5 py-3 transition-all">
              <div className="p-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-colors">
                <Sparkles className="w-5 h-5 text-purple-200" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">AI 추천 플레이리스트</p>
                <p className="text-purple-200/70 text-xs">AI가 취향에 맞게 추천</p>
              </div>
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 mb-6 inline-flex gap-2"
          >
            {[
              { id: "trending" as const, label: "플레이리스트", icon: Music2 },
              { id: "recent" as const, label: "최근 재생", icon: Clock },
              { id: "liked" as const, label: "좋아요", icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Music Grid / Playlist Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl"
          >
            <h3 className="text-white text-2xl mb-4">
              {activeTab === "trending" && "플레이리스트"}
              {activeTab === "recent" && "최근 재생"}
              {activeTab === "liked" && "좋아요 목록"}
            </h3>
            
            {/* Playlist Posts for Trending Tab */}
            {activeTab === "trending" && (
              <div className="space-y-4">
                {playlistPosts.map((post, postIndex) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + postIndex * 0.1 }}
                    className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {/* Post Header - 클릭하면 곡 목록 펼치기 */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setExpandedPlaylist(expandedPlaylist === post.id ? null : post.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Playlist Cover */}
                        <div className={`w-24 h-24 bg-gradient-to-br ${post.coverGradient} rounded-xl shrink-0 flex items-center justify-center text-3xl shadow-lg`}>
                          {post.author.avatar}
                        </div>
                        
                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/60 text-sm">{post.author.name}</span>
                            <span className="text-white/40 text-xs">• {post.createdAt}</span>
                          </div>
                          <h4 className="text-white text-lg font-medium mb-1 truncate">{post.title}</h4>
                          <p className="text-white/60 text-sm line-clamp-2">{post.description}</p>
                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {post.tags.slice(0, 4).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 text-xs bg-white/10 text-white/70 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-white/40 text-xs mt-2">{post.tracks.length}곡</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                        {/* Like */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePlaylist(post.id);
                          }}
                          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        
                        {/* Comment */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlaylist(expandedPlaylist === post.id ? null : post.id);
                          }}
                          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments.length}</span>
                        </button>
                        
                        {/* Share */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(post);
                          }}
                          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares}</span>
                        </button>

                        {/* Expand Indicator */}
                        <div className="ml-auto flex items-center gap-1 text-white/50">
                          {expandedPlaylist === post.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedPlaylist === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {/* Track List */}
                          <div className="px-4 pb-4">
                            <div className="backdrop-blur-lg bg-black/20 rounded-xl p-3 space-y-1">
                              {post.tracks.map((track, trackIndex) => {
                                const isLoading = loadingTrack === `${track.title}-${track.artist}`;
                                const trackKey = `${track.title}-${track.artist}`;
                                const albumImage = trackAlbumImages[trackKey];
                                // 플레이리스트 트랙 목록 준비
                                const playlistTracks = post.tracks.map((t) => ({
                                  title: t.title,
                                  artist: t.artist,
                                  albumImage: trackAlbumImages[`${t.title}-${t.artist}`],
                                  duration: t.duration,
                                }));
                                return (
                                  <div
                                    key={track.id}
                                    onClick={() => handlePlayTrackFromPlaylist(trackIndex, playlistTracks)}
                                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group ${isLoading ? 'bg-white/10' : ''}`}
                                  >
                                    <span className="w-6 text-white/40 text-sm text-center">{trackIndex + 1}</span>
                                    {/* Album Image with Play Button Overlay */}
                                    <div className="relative w-10 h-10 shrink-0">
                                      {albumImage ? (
                                        <img 
                                          src={albumImage} 
                                          alt={track.title}
                                          className="w-10 h-10 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg animate-pulse" />
                                      )}
                                      <div 
                                        className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity ${isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                      >
                                        {isLoading ? (
                                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        ) : (
                                          <Play className="w-4 h-4 text-white ml-0.5" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm truncate">{track.title}</p>
                                      <p className="text-white/50 text-xs truncate">{track.artist}</p>
                                    </div>
                                    <span className="text-white/40 text-xs mr-2">{track.duration}</span>
                                    {/* 곡 좋아요 버튼 */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // 최근 재생 기록에 있으면 좋아요 토글
                                        const existingTrack = recentlyPlayed.find(
                                          t => t.title === track.title && t.artist === track.artist
                                        );
                                        if (existingTrack) {
                                          setRecentlyPlayed(prev =>
                                            prev.map(t =>
                                              t.id === existingTrack.id
                                                ? { ...t, isLiked: !t.isLiked }
                                                : t
                                            )
                                          );
                                        } else {
                                          // 없으면 새로 추가하고 좋아요
                                          const newTrack = {
                                            id: `${track.title}-${track.artist}-${Date.now()}`,
                                            title: track.title,
                                            artist: track.artist,
                                            albumImage: albumImage || "",
                                            duration: track.duration || "0:00",
                                            playedAt: new Date(),
                                            isLiked: true,
                                          };
                                          setRecentlyPlayed(prev => [newTrack, ...prev].slice(0, 50));
                                        }
                                      }}
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                      <Heart
                                        className={`w-4 h-4 ${
                                          recentlyPlayed.some(
                                            t => t.title === track.title && t.artist === track.artist && t.isLiked
                                          )
                                            ? "fill-red-500 text-red-500"
                                            : "text-white/50 hover:text-white/80"
                                        }`}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Comments Section */}
                          <div className="px-4 pb-4 border-t border-white/10">
                            <h5 className="text-white text-sm font-medium my-3">댓글 {post.comments.length}개</h5>
                            
                            {/* Comment Input */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">
                                👤
                              </div>
                              <div className="flex-1 relative">
                                <Input
                                  type="text"
                                  placeholder="댓글 작성..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                                  className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Send className="w-4 h-4 text-white/60" />
                                </button>
                              </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {post.comments.length === 0 ? (
                                <p className="text-white/40 text-sm text-center py-4">첫 번째 댓글을 남겨보세요!</p>
                              ) : (
                                post.comments.map((comment) => (
                                  <div key={comment.id} className="flex gap-2 bg-white/5 rounded-lg p-2">
                                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs shrink-0">
                                      👤
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-white text-xs font-medium">{comment.author}</span>
                                        <span className="text-white/40 text-xs">{comment.createdAt}</span>
                                      </div>
                                      <p className="text-white/80 text-sm">{comment.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Song List for other tabs */}
            {activeTab !== "trending" && (
              <div className="space-y-4">
                {/* 최근 재생 탭 */}
                {activeTab === "recent" && (
                  <>
                    {recentlyPlayed.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-2xl p-8"
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-2xl flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-white/60" />
                          </div>
                          <p className="text-white/80 mb-2">최근 재생한 곡이 없습니다</p>
                          <p className="text-white/50 text-sm">플레이리스트에서 곡을 재생해보세요!</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-2">
                        {recentlyPlayed.slice(0, 10).map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                            onClick={() => handlePlayTrack(item.title, item.artist, item.albumImage, item.duration)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                                <span>{i + 1}</span>
                              </div>
                              {item.albumImage ? (
                                <img src={item.albumImage} alt={item.title} className="w-12 h-12 rounded-lg shrink-0 group-hover:scale-105 transition-transform object-cover" />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                                  <Music2 className="w-6 h-6 text-white/80" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white truncate">{item.title}</p>
                                <p className="text-white/60 text-sm truncate">{item.artist}</p>
                              </div>
                              <div className="text-white/60 text-sm hidden sm:block">{item.duration}</div>
                              <button 
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentlyPlayed(prev => prev.map(track => track.id === item.id ? { ...track, isLiked: !track.isLiked } : track));
                                }}
                              >
                                <Heart className={`w-5 h-5 ${item.isLiked ? "fill-red-500 text-red-500" : "text-white/70"}`} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 좋아요 탭 */}
                {activeTab === "liked" && (
                  <div className="space-y-6">
                    {/* 좋아요한 플레이리스트 섹션 */}
                    <div>
                      <h3 className="text-white/80 text-lg font-medium mb-3 flex items-center gap-2">
                        <Music2 className="w-5 h-5 text-purple-400" />
                        좋아요한 플레이리스트
                      </h3>
                      {playlistPosts.filter(post => post.isLiked).length === 0 ? (
                        <div className="backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-xl p-6">
                          <p className="text-white/50 text-center text-sm">좋아요한 플레이리스트가 없습니다</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {playlistPosts.filter(post => post.isLiked).map((post, i) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                              onClick={() => setExpandedPlaylist(expandedPlaylist === post.id ? null : post.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${post.coverGradient} rounded-lg shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <Music2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium truncate">{post.title}</p>
                                  <p className="text-white/50 text-sm truncate">{post.author.name} · {post.tracks.length}곡</p>
                                </div>
                                <button
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikePlaylist(post.id);
                                  }}
                                >
                                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 좋아요한 곡 섹션 */}
                    <div>
                      <h3 className="text-white/80 text-lg font-medium mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        좋아요한 곡
                      </h3>
                      {likedTracks.size === 0 ? (
                        <div className="backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-xl p-6">
                          <p className="text-white/50 text-center text-sm">좋아요한 곡이 없습니다</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Array.from(likedTracks).map((trackKey, i) => {
                            const [title, artist] = trackKey.split('-');
                            // recentlyPlayed에서 앨범 이미지와 duration 찾기
                            const recentTrack = recentlyPlayed.find(t => t.title === title && t.artist === artist);
                            const albumImage = recentTrack?.albumImage || trackAlbumImages[trackKey];
                            const duration = recentTrack?.duration || "";
                            
                            return (
                              <motion.div
                                key={trackKey}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                                onClick={() => handlePlayTrack(title, artist, albumImage, duration)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                                    <span>{i + 1}</span>
                                  </div>
                                  {albumImage ? (
                                    <img src={albumImage} alt={title} className="w-12 h-12 rounded-lg shrink-0 group-hover:scale-105 transition-transform object-cover" />
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                                      <Music2 className="w-6 h-6 text-white/80" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white truncate">{title}</p>
                                    <p className="text-white/60 text-sm truncate">{artist}</p>
                                  </div>
                                  {duration && <div className="text-white/60 text-sm hidden sm:block">{duration}</div>}
                                  <button 
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // 좋아요 해제
                                      setLikedTracks(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(trackKey);
                                        localStorage.setItem("likedTracks", JSON.stringify([...newSet]));
                                        return newSet;
                                      });
                                    }}
                                  >
                                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View All Button */}
            <button className="w-full mt-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white hover:bg-white/20 transition-all">
              더 보기
            </button>
          </motion.div>

          {/* AI 추천 플레이리스트 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h3 className="text-white text-2xl">AI 추천 플레이리스트</h3>
            </div>
            {aiRecommendedPlaylists.length === 0 ? (
              <div 
                onClick={() => setIsAIRecommendOpen(true)}
                className="backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/80 mb-2">아직 AI 추천 플레이리스트가 없습니다</p>
                  <p className="text-white/50 text-sm">클릭하여 AI 추천을 받아보세요!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {aiRecommendedPlaylists.map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    layout
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden"
                  >
                    {/* 플레이리스트 헤더 */}
                    <div
                      onClick={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                      className="p-4 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-20 h-20 bg-gradient-to-br ${playlist.coverGradient} rounded-xl shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center`}>
                          <Sparkles className="w-8 h-8 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium mb-1 truncate">{playlist.title}</p>
                          <p className="text-white/60 text-sm">{playlist.tracks.length}곡</p>
                          <p className="text-white/40 text-xs mt-1">{playlist.createdAt}</p>
                        </div>
                        <div className="text-white/60">
                          {expandedPlaylist === playlist.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 곡 목록 (펼쳐졌을 때) */}
                    <AnimatePresence>
                      {expandedPlaylist === playlist.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 space-y-2">
                            <p className="text-white/60 text-sm mb-3">{playlist.description}</p>
                            {playlist.tracks.map((track, idx) => (
                              <div
                                key={track.id}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const trackKey = `${track.title}-${track.artist}`;
                                  setLoadingTrack(trackKey);
                                  try {
                                    const videoId = await getYoutubeVideoId(track.title, track.artist);
                                    if (videoId) {
                                      const trackInfo = await getTrackInfo(track.title, track.artist);
                                      setCurrentTrack({
                                        track: trackInfo ? {
                                          title: trackInfo.title,
                                          artists: trackInfo.artist,
                                          album: {
                                            title: trackInfo.album || "",
                                            image: trackInfo.albumImage || "",
                                          },
                                        } : {
                                          title: track.title,
                                          artists: track.artist,
                                          album: {
                                            title: "",
                                            image: "",
                                          },
                                        },
                                        videoId,
                                      });
                                    }
                                  } catch (error) {
                                    console.error("Error playing track:", error);
                                  } finally {
                                    setLoadingTrack(null);
                                  }
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group/track"
                              >
                                <span className="text-white/40 text-sm w-6">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm truncate">{track.title}</p>
                                  <p className="text-white/60 text-xs truncate">{track.artist}</p>
                                </div>
                                <span className="text-white/40 text-sm">{track.duration}</span>
                                <div className="opacity-0 group-hover/track:opacity-100 transition-opacity">
                                  {loadingTrack === `${track.title}-${track.artist}` ? (
                                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                  ) : (
                                    <Play className="w-5 h-5 text-purple-400" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                {/* 추가 버튼 */}
                <div 
                  onClick={() => setIsAIRecommendOpen(true)}
                  className="backdrop-blur-xl bg-white/5 border border-dashed border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Plus className="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors" />
                    <p className="text-white/50 text-sm mt-2 group-hover:text-white/80 transition-colors">AI 추천 더 받기</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom padding for music player */}
          <div className="h-32" />
        </div>
      </main>

      {/* Bottom Music Player - 트랙이 선택되었을 때만 표시 */}
      <MusicPlayer 
        track={currentTrack?.track ?? null}
        videoId={currentTrack?.videoId ?? null}
        onClose={() => setCurrentTrack(null)}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        hasPrevious={playQueue !== null && playQueue.currentIndex > 0}
        hasNext={playQueue !== null && playQueue.currentIndex < playQueue.tracks.length - 1}
        onTrackEnd={handleTrackEnd}
        isShuffle={isShuffle}
        onShuffleToggle={handleShuffleToggle}
        repeatMode={repeatMode}
        onRepeatToggle={handleRepeatToggle}
        isLiked={isCurrentTrackLiked}
        onLikeToggle={handleLikeToggle}
      />

      {/* Search Playlist Modal */}
      <SearchPlaylistModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTrack={(track, videoId) => {
          setCurrentTrack({ track, videoId });
          setIsSearchModalOpen(false);
          
          // 최근 재생 기록에 추가
          addToRecentlyPlayed({
            title: track.title,
            artist: track.artists,
            albumImage: track.album?.image,
          });
        }}
        userPlaylistPosts={playlistPosts.map(post => ({
          id: post.id,
          author: post.author,
          title: post.title,
          description: post.description,
          coverGradient: post.coverGradient,
          tags: post.tags,
          tracks: post.tracks,
        }))}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={(newPlaylist) => {
          // 새 플레이리스트를 playlistPosts에 추가
          const newPost: PlaylistPost = {
            id: Date.now(),
            author: { name: "나", avatar: "🎵" },
            title: newPlaylist.title,
            description: newPlaylist.description,
            coverGradient: "from-cyan-500 to-blue-600",
            tags: newPlaylist.tags || [],
            likes: 0,
            shares: 0,
            isLiked: false,
            createdAt: "방금 전",
            tracks: newPlaylist.tracks.map((t, i) => ({
              id: i + 1,
              title: t.title,
              artist: t.artist,
              duration: t.duration || "3:30",
              albumImage: t.albumImage,
            })),
            comments: [],
          };
          setPlaylistPosts([newPost, ...playlistPosts]);
          alert(`"${newPlaylist.title}" 플레이리스트가 생성되었습니다!`);
        }}
      />

      {/* AI Recommend Playlist Modal */}
      <AIRecommendModal
        isOpen={isAIRecommendOpen}
        onClose={() => setIsAIRecommendOpen(false)}
        onSelectPlaylist={(playlist) => {
          // AI 추천 플레이리스트를 aiRecommendedPlaylists에 추가
          const newPost: PlaylistPost = {
            id: Date.now(),
            author: { name: "AI 추천", avatar: "✨" },
            title: playlist.title,
            description: playlist.description,
            coverGradient: playlist.coverGradient,
            tags: playlist.tags || [],
            likes: 0,
            shares: 0,
            isLiked: false,
            createdAt: "방금 전",
            tracks: playlist.tracks.map((t, i) => ({
              id: i + 1,
              title: t.title,
              artist: t.artist,
              duration: t.duration,
            })),
            comments: [],
          };
          setAIRecommendedPlaylists([newPost, ...aiRecommendedPlaylists]);
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={() => {
          // 로그아웃 처리
          setIsProfileOpen(false);
          alert("로그아웃 되었습니다.");
          // 실제 로그아웃 로직 추가 (예: 로그인 화면으로 이동)
        }}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
