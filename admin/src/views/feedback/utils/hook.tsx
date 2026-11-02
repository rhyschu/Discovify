import "./reset.css";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { getFeedbackList, deleteFeedback, deleteFeedbacks } from "@/api/system";
import { ElForm, ElMessageBox } from "element-plus";
import { type Ref, ref, toRaw, reactive, onMounted } from "vue";

export function useFeedback(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 20,
    keyword: null
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 20,
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
      label: "Feedback ID",
      prop: "feedbackId",
      minWidth: 100
    },
    {
      label: "User ID",
      prop: "userId",
      minWidth: 100
    },
    {
      label: "Feedback",
      prop: "feedback",
      minWidth: 300,
      width: 700,
      cellRenderer: ({ row }) => {
        const feedback = row.feedback;
        if (!feedback || typeof feedback !== "string") {
          return feedback === null || feedback === undefined ? "" : "Invalid data";
        }

        const style = {
          "white-space": "normal",
          "word-break": "break-all"
        };

        return (
          <div style={style} title={feedback}>
            {feedback}
          </div>
        );
      }
    },
    {
      label: "Submitted",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "Actions",
      fixed: "right",
      width: 100,
      slot: "operation"
    }
  ];

  function handleDelete(row) {
    deleteFeedback(row.feedbackId)
      .then(res => {
        if (res.code === 0) {
          message(`Deleted feedback ID  ${row.feedbackId}  `, {
            type: "success"
          });
          onSearch();
        } else {
          message("Could not delete feedback: " + res.message, { type: "error" });
        }
      })
      .catch(err => {
        message("Could not delete feedback", { type: "error" });
        console.error("Could not delete feedback:", err);
      });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    form.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    form.pageNum = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    if (tableRef) {
      selectedNum.value = val.length;
      selectedFeedbackIds.value = val.map(item => item.feedbackId);
    }
  }

  const selectedFeedbackIds = ref<number[]>([]);

  function onSelectionCancel() {
    selectedNum.value = 0;
    selectedFeedbackIds.value = [];
    tableRef.value?.getTableRef()?.clearSelection();
  }

  function onbatchDel() {
    if (selectedFeedbackIds.value.length === 0) {
      message("Select feedback to delete", { type: "warning" });
      return;
    }
    ElMessageBox.confirm(
      `Confirm <strong>Delete selected</strong><strong style='color:var(--el-color-primary)'> ${selectedFeedbackIds.value.length} </strong> feedback entries??`,
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
        deleteFeedbacks(selectedFeedbackIds.value)
          .then(res => {
            if (res.code === 0) {
              message(`Deleted  ${selectedFeedbackIds.value.length}  feedback entries`, {
                type: "success"
              });
              onSearch();
              onSelectionCancel();
            } else {
              message("Could not delete selected feedback: " + res.message, { type: "error" });
            }
          })
          .catch(err => {
            message("Could not delete selected feedback", { type: "error" });
            console.error("Could not delete selected feedback:", err);
          });
      })
      .catch(() => {});
  }

  async function onSearch() {
    loading.value = true;
    const params = toRaw(form);
    if (params.keyword === "" || params.keyword == null) {
      params.keyword = null;
    }

    try {
      const { data } = await getFeedbackList(params);
      dataList.value = data.items;
      pagination.total = data.total;
    } catch (e) {
      console.error("Could not load feedback:", e);
      message("Could not load feedback", { type: "error" });
      dataList.value = [];
      pagination.total = 0;
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const resetForm = (formEl: InstanceType<typeof ElForm> | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    form.keyword = null;
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    onSearch,
    resetForm,
    onbatchDel,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    onSelectionCancel,
    deviceDetection
  };
}
