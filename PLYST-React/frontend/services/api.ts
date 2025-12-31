import axios from 'axios';

const API_BASE_URL = 'http://52.78.220.83:8081';

// axios 인스턴스 생성 (타임아웃 설정)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
});

// Spotify 플레이리스트 검색
export interface Playlist {
  id: string;
  name: string;
  image: string;
  owner: string;
}

// 플레이리스트 내 트랙
export interface Track {
  title: string;
  album: {
    title: string;
    image: string;
  };
  artists: string;
}

// Spotify 플레이리스트 검색
export const searchPlaylists = async (keyword: string, offset: number = 0): Promise<Playlist[]> => {
  try {
    const response = await apiClient.get(`/search/playlist/${encodeURIComponent(keyword)}?offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('플레이리스트 검색 오류:', error);
    return [];
  }
};

// 플레이리스트의 트랙 가져오기
export const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  try {
    const response = await apiClient.get(`/search/tracks/${playlistId}`, {
      timeout: 60000, // 대용량 플레이리스트를 위해 60초 타임아웃
    });
    return response.data;
  } catch (error) {
    console.error('트랙 가져오기 오류:', error);
    return [];
  }
};

// YouTube 비디오 ID 가져오기
export const getYoutubeVideoId = async (title: string, artist: string): Promise<string> => {
  try {
    // 특수문자 정리
    const cleanTitle = title.replace(/[\[\](){}'"<>]/g, ' ').trim();
    const cleanArtist = artist.replace(/[\[\](){}'"<>]/g, ' ').trim();
    
    const response = await apiClient.get(`/search/track`, {
      params: { title: cleanTitle, artist: cleanArtist },
      timeout: 15000, // 15초 타임아웃
    });
    return response.data || '';
  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    return '';
  }
};

// 트랙 정보 가져오기 (앨범 이미지 등)
export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  albumImage: string;
  duration: number;
}

export const getTrackInfo = async (title: string, artist: string): Promise<TrackInfo | null> => {
  try {
    const response = await apiClient.get(`/search/track/info`, {
      params: { title, artist }
    });
    return response.data;
  } catch (error) {
    console.error('트랙 정보 검색 오류:', error);
    return null;
  }
};
