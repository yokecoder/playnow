import { useState, useEffect, useCallback } from "react";
import SearchBar from "../comps/searchbar";
import AudioPlayerContainer, { AudioPlayer, AudioPlayerMini, useAudioQueue } from "../comps/audioplayer";
import ExploreSection, { ExploreCard } from "../comps/exploresection";
import axios from "axios";

export default function Music() {
  const [search, setSearch] = useState("");
  const [miniPlayer, setMiniPlayer] = useState(true);
  const [exploreData, setExploreData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Location, setLocation] = useState("");
  const { audioQueue } = useAudioQueue();
  const currentYear = new Date().getFullYear();
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    return JSON.parse(localStorage.getItem("recentlyPlayed")) || [];
  });

  useEffect(() => {
    if (recentlyPlayed.length > 0) {
      localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
    }
  }, [recentlyPlayed]);
  
  useEffect(() => {
    const urls = [
      { key: "trending", url: `/musicapis/ytmusic/search?q=youtube Trending music global ${currentYear} | Latest hit songs ${currentYear} | popular songs ${currentYear}  &type=playlist` },
      { key: "newReleases", url: `/musicapis/ytmusic/search?q=new release ${currentYear} songs and playlists in ${Location} &type=playlist` },
      { key: "languages", url: `/musicapis/ytmusic/search?q=Trending music global ${currentYear} | English, Hindi, Tamil, Malayalam, Kannada and more  playlists &type=playlists` },
      { key: "moods", url: "/musicapis/ytmusic/search?q=Trending music global | mood based songs playlists spotify and youtube &type=playlists" },
      { key: "artists", url: "/musicapis/ytmusic/search?q=Trending music global |  trend artists in world wide &type=artists" },
      { key: "categories", url: "/musicapis/spotifyapi?ep=/browse/categories" },
    ];

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const responses = await Promise.allSettled(
          urls.map(({ url }) =>
            axios.get(`https://server-playnow-production.up.railway.app${url}`)
          )
        );

        const newData = responses.reduce((acc, res, index) => {
          if (res.status === "fulfilled") {
            acc[urls[index].key] = res.value.data;
          }
          return acc;
        }, {});

        setExploreData(newData);
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    console.log(exploreData.trending)
  }, []);

  

  return (
    <div>
      <SearchBar value={search} hint="Search for songs, albums, artists" onChange={setSearch} onCancel={() => setSearch("")} />

      <div className="explore-section">
        
        {loading ? (<div className="loader-container"> <div className="loader">  </div>  <div>Loading</div>  </div>) : (
          <>
          <ExploreSection caption="Explore Genres">
            {exploreData?.categories?.categories?.items?.map((item, idx) => (
              <div key={idx} style={{ backgroundImage: `url(${item?.icons?.[0]?.url || ""})` }} className="carousel-card">
                <span className="category-item-name">{item?.name}</span>
              </div>
            ))}
          </ExploreSection>
          
          {recentlyPlayed.length > 0 && (
            <ExploreSection caption="Recently Played">
              
            </ExploreSection>
          )}
          
          <ExploreSection caption="Discover What's Trending">
            {exploreData?.trending?.map((item, idx) => (
              item?.playlistId && (
                <ExploreCard title={item?.name} thumbnail={item?.thumbnails?.[ item?.thumbnails?.length - 1 ]?.url || item?.thumbnails?.[0]?.url } refUrl={item?.url} type={item?.type} artist={item?.artist?.name} year={ item?.year }/>
              )
            ))}
          </ExploreSection>
          
          <ExploreSection caption="New Releases">
            {exploreData?.newReleases?.map((item, idx) => (
              item?.url !== "" && (
                <ExploreCard title={item?.name} thumbnail={item?.thumbnails?.[ item?.thumbnails?.length - 1 ]?.url || item?.thumbnails?.[0]?.url } refUrl={item?.url} artist={item?.artist?.name} type={item?.type}/>
              )
            ))}
          </ExploreSection>
          
          <ExploreSection caption="Listen to Your Language">
            {exploreData?.languages?.map((item, idx) => (
              item?.playlistId && item?.url !== "" && (
                <ExploreCard title={item?.name} thumbnail={item?.thumbnails?.[ item?.thumbnails?.length - 1 ]?.url || item?.thumbnails?.[0]?.url } refUrl={item?.url} artist={item?.artist?.name} type={item?.type}/>
              )
            ))}
          </ExploreSection>
          
          <ExploreSection caption="Songs For Every Mood">
            {exploreData?.moods?.map((item, idx) => (
              item?.playlistId && item?.url !== "" && (
                <ExploreCard title={item?.name} thumbnail={item?.thumbnails?.[ item?.thumbnails?.length - 1 ]?.url || item?.thumbnails?.[0]?.url } refUrl={item?.url} artist={item?.artist?.name} type={item?.type}/>
              )
            ))}
          </ExploreSection>
          
          <ExploreSection caption="Discover Your Favourite Artists">
            {exploreData?.artists?.map((item, idx) => (
               item?.artistId  && (
                <ExploreCard title={item?.name} thumbnail={item?.thumbnails?.[ item?.thumbnails?.length - 1 ]?.url || item?.thumbnails?.[0]?.url } refUrl={item?.url} artist={item?.artist?.name} type={item?.type}/>
              )
            ))}
          </ExploreSection>
          
          
          
          
          </>
        )}
        

        
      </div>

      {audioQueue.length > 0 && (
        <AudioPlayerContainer url={audioQueue[0]}>
          {miniPlayer ? <AudioPlayerMini onExpand={() => setMiniPlayer(false)} /> : <AudioPlayer onClose={() => setMiniPlayer(true)} />}
        </AudioPlayerContainer>
      )}
    </div>
  );
}