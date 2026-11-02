import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps } from "../utils/types";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getArtistList,
  addArtist,
  updateArtist,
  updateArtistAvatar,
  deleteArtist,
  deleteArtists
} from "@/api/system";
import { type Ref, h, ref, toRaw, computed, reactive, onMounted } from "vue";

export function useArtist(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    artistName: null,
    area: null,
    gender: null
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const avatarInfo = ref();
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
      label: "Artist ID",
      prop: "artistId",
      width: 90
    },
    {
      label: "ArtistAvatar",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="w-[64px] h-[64px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "Artist",
      prop: "artistName",
      minWidth: 130,
      width: 200
    },
    {
      label: "Type",
      prop: "gender",
      width: 50,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            row.gender === 0
              ? "primary"
              : row.gender === 1
                ? "danger"
                : row.gender === 2
                  ? "warning"
                  : "info"
          }
          effect="plain"
        >
          {row.gender === 0
            ? "Male"
            : row.gender === 1
              ? "Female"
              : row.gender === 2
                ? "Group/Band"
                : "Unknown"}
        </el-tag>
      )
    },
    {
      label: "Birthday",
      minWidth: 130,
      width: 130,
      prop: "birth",
      formatter: ({ birth }) => (birth ? dayjs(birth).format("YYYY-MM-DD") : "")
    },
    {
      label: "Country",
      prop: "area",
      minWidth: 100
    },
    {
      label: "Bio",
      prop: "introduction",
      width: 460,
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
    deleteArtist(row.artistId).then(res => {
      if (res.code === 0) {
        message(`Deleted artist ID  ${row.artistId}  `, {
          type: "success"
        });
        onSearch();
      } else {
        message("Could not delete artist", { type: "error" });
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
    const ids = getKeyList(curSelected, "artistId");

    deleteArtists(ids)
      .then(res => {
        if (res.code === 0) {
          message(`Deleted artist ID  ${ids}  `, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message("Could not delete artist", { type: "error" });
        }
      })
      .catch(err => {
        console.error("Could not delete artist", err);
        message("Could not delete artist", { type: "error" });
      });
  }

  async function onSearch() {
    try {
      const result = await getArtistList(toRaw(form));

      if (result.code === 0 && result.data && result.data.items) {
        pagination.total = result.data.total;
        dataList.value = result.data.items.map(item => ({
          artistId: item.artistId,
          artistName: item.artistName,
          gender: item.gender,
          avatar: item.avatar,
          birth: item.birth,
          area: item.area,
          introduction: item.introduction
        }));
      } else {
        dataList.value = [];
        pagination.total = 0;
        message("No matching artists found", { type: "warning" });
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

  function openDialog(title = "Add", row?: FormItemProps) {
    addDialog({
      title: `${title} artist`,
      props: {
        formInline: {
          title,
          artistId: row?.artistId ?? "",
          artistName: row?.artistName ?? "",
          gender: row?.gender ?? "",
          birth: row?.birth ?? "",
          area: row?.area ?? "",
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
          message(`You ${title} artist:  ${curData.artistName}  `, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            if (title === "Add") {
              addArtist(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not add artist: " + res.message, { type: "error" });
                }
              });
            } else {
              updateArtist(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not update artist: " + res.message, { type: "error" });
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
      title: "Crop and upload avatar",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: async done => {
        if (!avatarInfo.value?.blob) {
          message("Could not crop this image. Please try again.", { type: "error" });
          return;
        }
        const formData = new FormData();
        formData.append("avatar", avatarInfo.value.blob);
        formData.append("artistId", row.artistId);

        try {
          const res = await updateArtistAvatar(row.artistId, formData);

          if (res.code === 0) {
            message("Avatar uploaded", { type: "success" });
            done();
            onSearch();
          } else {
            message("Could not upload avatar", { type: "error" });
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
