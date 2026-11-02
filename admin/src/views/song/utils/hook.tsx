import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import songCover from "@/assets/song.jpg";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps } from "../utils/types";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getAllArtists,
  getSongList,
  addSong,
  updateSong,
  updateSongCover,
  deleteSong,
  deleteSongs
} from "@/api/system";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";

export function useSong(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    sortBy: "artistName",
    sortOrder: "asc",
    artistId: null,
    songName: null,
    album: null
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const coverInfo = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "Select",
      type: "selection",
      fixed: "left",
      reserveSelection: true 
    },
    {
      label: "Song ID",
      prop: "songId",
      width: 90
    },
    {
      label: "Cover",
      prop: "cover",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.cover || songCover}
          preview-src-list={Array.of(row.cover || songCover)}
          class="w-[72px] h-[72px] rounded-lg align-middle"
        />
      ),
      width: 90
    },
    {
      label: "Song title",
      prop: "songName",
      sortable: "custom",
      minWidth: 130
    },
    {
      label: "Artist",
      prop: "artistName",
      sortable: "custom",
      minWidth: 160
    },
    {
      label: "Album",
      prop: "album",
      sortable: "custom",
      minWidth: 160,
      width: 200
    },
    {
      label: "Genre",
      prop: "style",
      minWidth: 130,
      cellRenderer: ({ row }) =>
        row.style && Array.isArray(row.style)
          ? row.style.map((tag, index) => (
              <el-tag key={index} class="mr-1">
                {tag}
              </el-tag>
            ))
          : "-"
    },
    {
      label: "Release date",
      minWidth: 130,
      width: 130,
      prop: "releaseTime",
      formatter: ({ releaseTime }) => dayjs(releaseTime).format("YYYY-MM-DD")
    },
    {
      label: "Actions",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });

  function handleUpdate(row) { openDialog("Edit", row); }

  function handleDelete(row) {
    deleteSong(row.songId).then(res => {
      if (res.code === 0) {
        message(`Deleted song ID  ${row.songId}  `, {
          type: "success"
        });
        onSearch();
      } else {
        message("Could not delete song", { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    // console.log(`${val} items per page`);
    pagination.pageSize = val;
    form.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    // console.log(`current page: ${val}`);
    pagination.currentPage = val;
    form.pageNum = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    tableRef.value.setAdaptive();
  }

  function onSelectionCancel() {
    selectedNum.value = 0;
    tableRef.value.getTableRef().clearSelection();
  }

  function onbatchDel() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const ids = getKeyList(curSelected, "songId");

    deleteSongs(ids)
      .then(res => {
        if (res.code === 0) {
          message(`Deleted song ID  ${ids}  `, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message("Could not delete song", { type: "error" });
        }
      })
      .catch(err => {
        console.error("Could not delete song", err);
        message("Could not delete song", { type: "error" });
      });
  }

  async function fetchArtists() {
    try {
      const result = await getAllArtists();

      if (result.code === 0 && Array.isArray(result.data)) {
        treeData.value = result.data.map(item => ({
          label: item.artistName,
          value: item.artistId,
          children: []
        }));
        // if (result.data.length > 0) {
        //   form.artistId = result.data[0].artistId;
        // }
        onSearch();
      } else {
        console.error("API Unexpected response:", result);
        message("Could not load artists", { type: "error" });
      }
    } catch (error) {
      console.error("Request failed: ", error);
      message("Your session expired. Please sign in again.", { type: "error" });
    }
  }

  async function onSearch() {
    try {
      const result = await getSongList(toRaw(form));

      if (result.code === 0 && result.data && result.data.items) {
        pagination.total = result.data.total;
        dataList.value = result.data.items.map(item => ({
          songId: item.songId,
          songName: item.songName,
          artistName: item.artistName,
          album: item.album,
          cover: item.coverUrl,
          audio: item.audioUrl,
          style: item.style ? item.style.split(",") : [],
          releaseTime: item.releaseTime
        }));
      } else {
        dataList.value = [];
        pagination.total = 0;
        message("No matching artists found", { type: "warning" });
      }
    } catch (error) {
      console.error("Request failed: ", error);
      message("Request failed. Please try again.", { type: "error" });
    }

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  watch(
    () => form.artistId,
    newId => {
      if (newId) {
        onSearch();
      }
    }
  );

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.artistId = "";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ artistId, selected }) {
    form.artistId = selected ? artistId : "";
    pagination.currentPage = 1;
    form.pageNum = 1;
    onSearch();
  }

  function openDialog(title = "Add", row?: FormItemProps) {
    addDialog({
      title: `${title} song`,
      props: {
        formInline: {
          title,
          artistId: form.artistId ?? 0,
          artistName: row?.artistName ?? "",
          songId: row?.songId ?? 0,
          songName: row?.songName ?? "",
          album: row?.album ?? "",
          style: row?.style ?? [],
          releaseTime: row?.releaseTime ?? ""
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`You ${title} song:  ${curData.songName}  `, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            if (title === "Add") {
              const payload = { ...curData, style: Array.isArray(curData.style) ? curData.style.join(",") : "" };
              addSong(payload).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not add song: " + res.message, { type: "error" });
                }
              });
            } else {
              const payload = { ...curData, style: Array.isArray(curData.style) ? curData.style.join(",") : "" };
              updateSong(payload).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not update song: " + res.message, { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  
  async function handleUpload(row) {
    addDialog({
      title: "Crop and upload cover",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.cover || songCover,
          onCropper: info => (coverInfo.value = info)
        }),
      beforeSure: async done => {
        if (!coverInfo.value?.blob) {
          message("Could not crop this image. Please try again.", { type: "error" });
          return;
        }
        const formData = new FormData();
        formData.append("cover", coverInfo.value.blob);
        formData.append("songId", row.songId);

        try {
          const res = await updateSongCover(row.songId, formData);

          if (res.code === 0) {
            message("Cover uploaded", { type: "success" });
            done();
            onSearch();
          } else {
            message("Could not upload cover", { type: "error" });
          }
        } catch (error) {
          console.error("Upload failed:", error);
          message("Upload failed. Please try again.", { type: "error" });
        }
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    await fetchArtists();
    if (form.artistId) {
      await onSearch();
    }
    treeLoading.value = false;
  });

  function handleSortChange({ prop, order }) {
    form.sortBy = prop || "artistName";
    form.sortOrder = order === "descending" ? "desc" : "asc";
    form.pageNum = 1; pagination.currentPage = 1; onSearch();
  }

  return {
    handleSortChange,
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
