import "./reset.css";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import playlistCover from "@/assets/song.jpg";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps } from "../utils/types";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getPlaylistList,
  addPlaylist,
  updatePlaylist,
  updatePlaylistCover,
  deletePlaylist,
  deletePlaylists
} from "@/api/system";
import { type Ref, h, ref, toRaw, computed, reactive, onMounted } from "vue";

export function usePlaylist(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    title: null,
    style: null
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const coverInfo = ref();
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
      label: "Playlist ID",
      prop: "playlistId",
      width: 90
    },
    {
      label: "Cover",
      prop: "cover",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.cover || playlistCover}
          preview-src-list={Array.of(row.cover || playlistCover)}
          class="w-[72px] h-[72px] rounded-lg align-middle"
        />
      ),
      width: 90
    },
    {
      label: "Playlist",
      prop: "title",
      minWidth: 300
    },
    {
      label: "Genre",
      prop: "style",
      minWidth: 180,
      cellRenderer: ({ row }) => (row.style ? <el-tag>{row.style}</el-tag> : "")
    },
    {
      label: "Bio",
      prop: "introduction",
      minWidth: 300,
      width: 420,
      formatter: ({ introduction }) => {
        if (!introduction) {
          return "";
        }
        if (typeof introduction !== "string") {
          return "Invalid data";
        }
        const maxChars = 60;
        if (introduction.length > maxChars) {
          return introduction.slice(0, maxChars) + "...";
        }
        return introduction;
      }
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

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    deletePlaylist(row.playlistId).then(res => {
      if (res.code === 0) {
        message(`Deleted playlist ID  ${row.playlistId}  `, {
          type: "success"
        });
        onSearch();
      } else {
        message("Could not delete playlist", { type: "error" });
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
    const ids = getKeyList(curSelected, "playlistId");

    deletePlaylists(ids)
      .then(res => {
        if (res.code === 0) {
          message(`Deleted playlist ID  ${ids}  `, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message("Could not delete playlist", { type: "error" });
        }
      })
      .catch(err => {
        console.error("Could not delete playlist", err);
        message("Could not delete playlist", { type: "error" });
      });
  }

  async function onSearch() {
    try {
      const result = await getPlaylistList(toRaw(form));

      if (result.code === 0 && result.data && result.data.items) {
        pagination.total = result.data.total;
        dataList.value = result.data.items.map(item => ({
          playlistId: item.playlistId,
          title: item.title,
          cover: item.coverUrl,
          style: item.style,
          introduction: item.introduction
        }));
      } else {
        dataList.value = [];
        pagination.total = 0;
        message("No matching playlists found", { type: "warning" });
      }
    } catch (error) {
      console.error("Request failed: ", error);
      message("Your session expired. Please sign in again.", { type: "error" });
    }

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(formTitle = "Add", row?: FormItemProps) {
    addDialog({
      title: `${formTitle}Playlist`,
      props: {
        formInline: {
          formTitle,
          playlistId: row?.playlistId ?? "",
          title: row?.title ?? "",
          style: row?.style ?? "",
          introduction: row?.introduction ?? ""
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
          message(`You ${formTitle} playlist:  ${curData.title}  `, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            if (formTitle === "Add") {
              addPlaylist(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not add playlist: " + res.message, { type: "error" });
                }
              });
            } else {
              updatePlaylist(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not update playlist: " + res.message, { type: "error" });
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
      title: "Crop and upload playlist cover",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.cover || playlistCover,
          onCropper: info => (coverInfo.value = info)
        }),
      beforeSure: async done => {
        if (!coverInfo.value?.blob) {
          message("Could not crop this image. Please try again.", { type: "error" });
          return;
        }
        const formData = new FormData();
        formData.append("cover", coverInfo.value.blob);
        formData.append("playlistId", row.playlistId);

        try {
          const res = await updatePlaylistCover(row.playlistId, formData);

          if (res.code === 0) {
            message("Playlist cover uploaded", { type: "success" });
            done();
            onSearch();
          } else {
            message("Could not upload playlist cover", { type: "error" });
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
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
