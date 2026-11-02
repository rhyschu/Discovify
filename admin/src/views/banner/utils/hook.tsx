import "./reset.css";
import { message } from "@/utils/message";
import bannerCover from "@/assets/cover.png";
import { usePublicHooks } from "../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropper from "@/components/ReCropper";
import { getKeyList, deviceDetection, formatBytes } from "@pureadmin/utils";
import { ElMessageBox, ElSwitch, ElImage } from "element-plus";
import { h, ref, computed, reactive, onMounted, type Ref } from "vue";
import {
  getBannerList,
  addBanner,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
  deleteBanners
} from "@/api/system";

export function useBanner(formData: any, tableRef: Ref) {
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const selectionList = ref([]);
  const latestBlob = ref<Blob | null>(null);
  const latestBase64 = ref<string | null>(null);
  const latestInfo = ref<any>(null);
  const { switchStyle } = usePublicHooks();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 5,
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
      label: "Banner ID",
      prop: "bannerId",
      minWidth: 100
    },
    {
      label: "Banner",
      prop: "bannerUrl",
      minWidth: 400,
      cellRenderer: ({ row }) => (
        <ElImage
          fit="cover"
          preview-teleported={true}
          src={row.bannerUrl}
          preview-src-list={[row.bannerUrl]}
          class="w-[500px] h-[195px] rounded-lg align-middle"
        />
      )
    },
    {
      label: "Status",
      prop: "bannerStatus",
      minWidth: 200,
      cellRenderer: scope => (
        <ElSwitch
          v-model={scope.row.bannerStatus}
          activeValue={0}
          inactiveValue={1}
          style={switchStyle.value}
          onChange={val => onChange(scope.row, scope.$index, val)}
        />
      )
    },
    {
      label: "Actions",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  function onChange(row, index, newValue) {
    ElMessageBox.confirm(
      `Confirm <strong>${
        newValue === 1 ? "Disable" : "Enable"
      }</strong><strong style='color:var(--el-color-primary)'> ID:${
        row.bannerId
      } </strong> banner??`,
      "Notice",
      {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        switchLoadMap.value[index] = {
          ...switchLoadMap.value[index],
          loading: true
        };
        updateBannerStatus(row.bannerId, newValue)
          .then(res => {
            if (res.code === 0) {
              row.bannerStatus = newValue;
              message("Banner status updated", { type: "success" });
              onSearch();
            } else {
              message("Could not update banner status: " + res.message, { type: "error" });
              row.bannerStatus = row.bannerStatus === 1 ? 0 : 1;
            }
          })
          .catch(err => {
            console.error("Could not update banner status", err);
            message("Could not update banner status", { type: "error" });
            row.bannerStatus = row.bannerStatus === 1 ? 0 : 1;
          })
          .finally(() => {
            switchLoadMap.value[index] = {
              ...switchLoadMap.value[index],
              loading: false
            };
          });
      })
      .catch(() => {
        row.bannerStatus = row.bannerStatus === 1 ? 0 : 1;
      });
  }

  function handleDelete(row) {
    deleteBanner(row.bannerId)
      .then(res => {
        if (res.code === 0) {
          message(`Delete  ID   ${row.bannerId}  banner`, {
            type: "success"
          });
          onSearch();
        } else {
          message(`Could not delete record: ${res.message}`, { type: "error" });
        }
      })
      .catch(err => {
        message(`Could not delete record: ${err}`, { type: "error" });
      });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    selectionList.value = val;
  }

  function onSelectionCancel() {
    selectionList.value = [];
    tableRef.value?.getTableRef()?.clearSelection();
  }

  function onBatchDelete() {
    if (selectionList.value.length === 0) {
      message("Select records to delete", { type: "warning" });
      return;
    }

    ElMessageBox.confirm(
      `Delete selected  <strong>${selectionList.value.length}</strong>  banners??`,
      "Notice",
      {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        const ids = getKeyList(selectionList.value, "bannerId");
        loading.value = true;
        deleteBanners(ids)
          .then(res => {
            if (res.code === 0) {
              message(`Deleted  ${ids.length}  records`, { type: "success" });
              onSearch();
              onSelectionCancel();
            } else {
              message(`Could not delete selected records: ${res.message}`, { type: "error" });
            }
          })
          .catch(err => {
            message(`Could not delete selected records: ${err}`, { type: "error" });
          })
          .finally(() => {
            loading.value = false;
          });
      })
      .catch(() => {
      });
  }

  async function onSearch() {
    loading.value = true;
    const params = { ...formData, ...pagination };
    params.pageNum = params.currentPage;
    delete params.currentPage;
    delete params.total;

    try {
      const result = await getBannerList(params);

      if (result.code === 0 && result.data && result.data.items) {
        pagination.total = result.data.total;
        dataList.value = result.data.items.map(item => ({
          ...item,
          bannerStatus: item.bannerStatus === "ENABLE" ? 0 : 1
        }));
      } else {
        dataList.value = [];
        pagination.total = 0;
        message("No matching banners found", { type: "warning" });
      }
    } catch (error) {
      console.error("Request failed: ", error);
      message("Your session expired. Please sign in again.", { type: "error" });
    }

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function handleUpload(row?: any) {
    const isEdit = !!row?.bannerId;
    const title = isEdit ? "Edit banner" : "Add banner";

    addDialog({
      title: title,
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      closeOnClickModal: false,
      contentRenderer: () =>
        h(
          "div",
          {
            class: "flex justify-between items-start"
          },
          [
            h(
              "div",
              {
                class: "w-[60%] mr-4"
              },
              [
                h(ReCropper, {
                  src: isEdit ? row.bannerUrl : bannerCover,
                  options: {
                    aspectRatio: 1080 / 420,
                    viewMode: 1,
                    dragMode: "move"
                  },
                  onCropper: handleCropperData
                }),
                h(
                  "p",
                  {
                    class: "mt-2 text-center text-gray-500 text-sm"
                  },
                  "Right-click the crop area for more options."
                )
              ]
            ),
            h(
              "div",
              {
                class: "w-[40%] flex flex-col justify-center items-center"
              },
              [
                latestBase64.value
                  ? h(ElImage, {
                      src: latestBase64.value,
                      "preview-src-list": [latestBase64.value],
                      fit: "contain",
                      class: "w-full mb-2 max-h-[200px]"
                    })
                  : h("div", "Image loading or unavailable..."),
                latestInfo.value
                  ? h(
                      "div",
                      {
                        class: "mt-2 text-sm text-gray-600"
                      },
                      [
                        h(
                          "p",
                          `Image dimensions: ${parseInt(latestInfo.value.width)} × ${parseInt(latestInfo.value.height)} pixels`
                        ),
                        h(
                          "p",
                          `File size: ${formatBytes(latestInfo.value.size)} (${latestInfo.value.size}  bytes)`
                        )
                      ]
                    )
                  : null
              ]
            )
          ]
        ),
      beforeSure: async done => {
        const blob = latestBlob.value;

        if (!blob) {
          message("Choose and crop a valid image first.", { type: "warning" });
          return;
        }

        const formData = new FormData();
        formData.append("banner", blob, `banner_${Date.now()}.png`);
        loading.value = true;

        try {
          let res;
          if (isEdit) {
            res = await updateBanner(row.bannerId, formData);
          } else {
            res = await addBanner(formData);
          }

          if (res.code === 0) {
            message(isEdit ? "Updated" : "Created", { type: "success" });
            onSearch();
            done();
          } else {
            message(
              isEdit ? `Could not update record: ${res.message}` : `Could not create record: ${res.message}`,
              { type: "error" }
            );
          }
        } catch (error) {
          message(isEdit ? `Could not update record: ${error}` : `Could not create record: ${error}`, {
            type: "error"
          });
        } finally {
          loading.value = false;
        }
      },
      closeCallBack: () => {
        latestBlob.value = null;
        latestBase64.value = null;
        latestInfo.value = null;
      }
    });
  }

  function handleCropperData({
    blob,
    base64,
    info
  }: {
    blob: Blob;
    base64: string;
    info: any;
  }) {
    latestBlob.value = blob;
    latestBase64.value = base64;
    latestInfo.value = info;
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    selectionList,
    selectedNum: computed(() => selectionList.value.length),
    onSearch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleDelete,
    onBatchDelete,
    handleUpload
  };
}
