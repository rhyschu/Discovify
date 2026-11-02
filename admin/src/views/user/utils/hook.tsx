import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  getUserList,
  addUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  deleteUsers
} from "@/api/system";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
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

export function useUser(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 15,
    username: null,
    phone: null,
    userStatus: null
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 15,
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
      label: "User ID",
      prop: "userId",
      width: 90
    },
    {
      label: "Avatar",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="w-[36px] h-[36px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "Username",
      prop: "username",
      minWidth: 130
    },
    {
      label: "Phone number",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => {
        if (!phone) {
          return null;
        }
        return hideTextAtIndex(phone, { start: 3, end: 6 });
      }
    },
    {
      label: "Email",
      prop: "email",
      minWidth: 160
    },
    {
      label: "Status",
      prop: "userStatus",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          v-model={scope.row.userStatus}
          activeValue={0}
          inactiveValue={1}
          style={switchStyle.value}
          onChange={val => onChange(scope.row, scope.$index, val)}
        />
      )
    },
    {
      label: "Created",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "Updated",
      minWidth: 90,
      prop: "updateTime",
      formatter: ({ updateTime }) =>
        dayjs(updateTime).format("YYYY-MM-DD HH:mm:ss")
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
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "Very weak" },
    { color: "#EFBD47", text: "Weak" },
    { color: "#ffa500", text: "Fair" },
    { color: "#1bbf1b", text: "Strong" },
    { color: "#008000", text: "Very strong" }
  ];
  const curScore = ref();

  function onChange(row, index, newValue) {
    ElMessageBox.confirm(
      `Confirm <strong>${
        newValue === 1 ? "Disable" : "Enable"
      }</strong><strong style='color:var(--el-color-primary)'> ${
        row.username
      } </strong> user??`,
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
        updateUserStatus(row.userId, newValue)
          .then(res => {
            if (res.code === 0) {
              row.userStatus = newValue;
              message("User status updated", { type: "success" });
              onSearch();
            } else {
              message("Could not update user status: " + res.message, { type: "error" });
              row.userStatus = row.userStatus === 1 ? 0 : 1;
            }
          })
          .catch(err => {
            console.error("Could not update user status", err);
            message("Could not update user status", { type: "error" });
            row.userStatus = row.userStatus === 1 ? 0 : 1;
          })
          .finally(() => {
            switchLoadMap.value[index] = {
              ...switchLoadMap.value[index],
              loading: false
            };
          });
      })
      .catch(() => {
        row.userStatus = row.userStatus === 1 ? 0 : 1;
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    deleteUser(row.userId).then(res => {
      if (res.code === 0) {
        message(`Deleted user ID  ${row.userId}  `, {
          type: "success"
        });
        onSearch();
      } else {
        message("Could not delete user", { type: "error" });
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
    const ids = getKeyList(curSelected, "userId");

    deleteUsers(ids)
      .then(res => {
        if (res.code === 0) {
          message(`Deleted user ID  ${ids}  `, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message("Could not delete user", { type: "error" });
        }
      })
      .catch(err => {
        console.error("Could not delete user", err);
        message("Could not delete user", { type: "error" });
      });
  }

  async function onSearch() {
    try {
      const result = await getUserList(toRaw(form));

      if (result.code === 0 && result.data && result.data.items) {
        pagination.total = result.data.total;
        dataList.value = result.data.items.map(item => ({
          userId: item.userId,
          username: item.username,
          phone: item.phone,
          email: item.email,
          avatar: item.userAvatar,
          introduction: item.introduction,
          createTime: item.createTime,
          updateTime: item.updateTime,
          userStatus: item.userStatus === "ENABLE" ? 0 : 1
        }));
      } else {
        dataList.value = [];
        pagination.total = 0;
        message("No matching users found", { type: "warning" });
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
      title: `${title} user`,
      props: {
        formInline: {
          title,
          userId: row?.userId ?? "",
          username: row?.username ?? "",
          password: row?.password ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          userStatus: row?.userStatus ?? 1,
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
          message(`You ${title} user:  ${curData.username}  `, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            if (title === "Add") {
              addUser(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not add user: " + res.message, { type: "error" });
                }
              });
            } else {
              updateUser(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message("Could not update user: " + res.message, { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }

  const cropRef = ref();
  
  function handleUpload(row) {
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
      beforeSure: done => {
        console.log("Cropped image: ", avatarInfo.value);
        done();
        onSearch();
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  function handleReset(row) {
    addDialog({
      title: `Reset ${row.username} User Password`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "Enter a new password",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="Enter a new password"
              />
            </ElFormItem>
          </ElForm>
          <div class="mt-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(valid => {
          if (valid) {
            message(`Reset complete ${row.username} User Password`, {
              type: "success"
            });
            console.log(pwdForm.newPwd);
            done();
            onSearch();
          }
        });
      }
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
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
