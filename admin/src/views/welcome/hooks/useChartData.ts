import {
  getAllUsersCount,
  getAllArtistsCount,
  getAllSongsCount,
  getAllPlaylistsCount
} from "@/api/data";
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";

export default () => {
  
  const userCount = ref<number>(0);
  const artistCount = ref<number>(0);
  const songCount = ref<number>(0);
  const playlistCount = ref<number>(0);

  const popCount = ref<number>(0);
  const classicCount = ref<number>(0);
  const hiphopCount = ref<number>(0);
  const rockCount = ref<number>(0);
  const electronicCount = ref<number>(0);
  const jazzCount = ref<number>(0);
  const lightCount = ref<number>(0);

  const countAmerica = ref<number>(0);
  const countChina = ref<number>(0);
  const countKorea = ref<number>(0);
  const countJapan = ref<number>(0);
  const countGermany = ref<number>(0);
  const countBritain = ref<number>(0);

  const maleCount = ref<number>(0);
  const femaleCount = ref<number>(0);

  const songTypes = [
    "Pop",
    "Classical",
    "Hip-hop",
    "Rock",
    "Electronic",
    "R&B",
    "Easy Listening"
  ];

  const artistAreas = ["美国", "中国", "韩国", "日本", "德国", "英国"];

  const artistGenders = [0, 1];

  const fetchData = async () => {
    try {
      const songTypePromises = songTypes.map(type => getAllSongsCount(type));
      const artistAreasPromises = artistAreas.map(area =>
        getAllArtistsCount(undefined, area)
      );
      const artistGendersPromises = artistGenders.map(gender =>
        getAllArtistsCount(gender)
      );
      const allResponses = await Promise.all([
        getAllUsersCount(),
        getAllArtistsCount(),
        getAllSongsCount(),
        getAllPlaylistsCount(),
        ...songTypePromises,
        ...artistAreasPromises,
        ...artistGendersPromises
      ]);
      const userRes = allResponses[0];
      const artistRes = allResponses[1];
      const songRes = allResponses[2];
      const playlistRes = allResponses[3];
      const songTypeRes = allResponses.slice(4, 4 + songTypes.length);
      const artistAreaRes = allResponses.slice(
        4 + songTypes.length,
        4 + songTypes.length + artistAreas.length
      );
      const artistGenderRes = allResponses.slice(
        4 + songTypes.length + artistAreas.length
      );
      const responses = [
        userRes,
        artistRes,
        songRes,
        playlistRes,
        ...songTypeRes,
        ...artistAreaRes,
        ...artistGenderRes
      ];
      const counts = [
        userCount,
        artistCount,
        songCount,
        playlistCount,
        popCount,
        classicCount,
        hiphopCount,
        rockCount,
        electronicCount,
        jazzCount,
        lightCount,
        countAmerica,
        countChina,
        countKorea,
        countJapan,
        countGermany,
        countBritain,
        maleCount,
        femaleCount
      ];

      let allSuccess = true;
      responses.forEach((response, index) => {
        if (
          !response ||
          response.code !== 0 ||
          isNaN(Number(response.data))
        ) {
          allSuccess = false;
          console.error(
            `Response  ${index + 1} returned invalid data:`,
            response
          );
          return;
        } else {
          counts[index].value = Number(response.data);
        }
      });
      if (!allSuccess) {
        resetCounts();
      }
    } catch (error) {
      console.error("Could not load data:", error);
      message("Your session expired. Please sign in again.", { type: "error" });
      resetCounts();
    }
  };

  const resetCounts = () => {
    userCount.value = 0;
    artistCount.value = 0;
    songCount.value = 0;
    playlistCount.value = 0;
    popCount.value = 0;
    classicCount.value = 0;
    hiphopCount.value = 0;
    rockCount.value = 0;
    electronicCount.value = 0;
    jazzCount.value = 0;
    lightCount.value = 0;
    countAmerica.value = 0;
    countChina.value = 0;
    countKorea.value = 0;
    countJapan.value = 0;
    countGermany.value = 0;
    countBritain.value = 0;
    maleCount.value = 0;
    femaleCount.value = 0;
  };

  // const logCounts = () => {
  // };

  onMounted(fetchData);

  return {
    userCount,
    artistCount,
    songCount,
    playlistCount,
    popCount,
    classicCount,
    hiphopCount,
    rockCount,
    electronicCount,
    jazzCount,
    lightCount,
    countAmerica,
    countChina,
    countKorea,
    countJapan,
    countGermany,
    countBritain,
    maleCount,
    femaleCount
  };
};
