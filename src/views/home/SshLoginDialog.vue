<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AppDialog from "@/components/AppDialog.vue";
import MIcon from "@/components/MIcon.vue";
import SshLoginUtils from "../../../electron/utils/SshLoginUtils";

/* VM 的 SSH 帳號對話框：VM 的帳號是申請時自訂的，平台不幫忙帶，由使用者輸入；
   容器固定 root，不會開這個對話框。帳號在主程序會再驗一次 */
const props = defineProps<{ machineName: string; initialUsername: string }>();
const emit = defineEmits<{ confirm: [username: string] }>();
const open = defineModel<boolean>({ required: true });
const { t } = useI18n();

const username = ref("");
const touched = ref(false);
const input = ref<HTMLInputElement | null>(null);
const trimmed = computed(() => username.value.trim());
const invalid = computed(
  () =>
    touched.value &&
    !!trimmed.value &&
    !SshLoginUtils.isValidUsername(trimmed.value)
);

watch(open, value => {
  if (!value) return;
  username.value = props.initialUsername;
  touched.value = !!props.initialUsername;
  nextTick(() => {
    input.value?.focus();
    input.value?.select();
  });
});

const submit = () => {
  touched.value = true;
  if (!SshLoginUtils.isValidUsername(trimmed.value)) return;
  open.value = false;
  emit("confirm", trimmed.value);
};
</script>

<template>
  <AppDialog v-model="open" :title="t('home.sshLogin.title')" width="460px">
    <template #icon><MIcon name="terminal" :size="20" /></template>
    <form class="ssh-login" novalidate @submit.prevent="submit">
      <p class="ssh-login__machine">{{ machineName }}</p>
      <p>{{ t("home.sshLogin.description") }}</p>
      <label class="sl-field">
        <span>{{ t("home.sshLogin.label") }}</span>
        <input
          ref="input"
          v-model="username"
          class="sl-input"
          :class="{ 'sl-input--invalid': invalid }"
          type="text"
          :maxlength="SshLoginUtils.maxLength"
          :placeholder="t('home.sshLogin.placeholder')"
          autocomplete="username"
          autocapitalize="off"
          spellcheck="false"
          :aria-invalid="invalid"
          aria-describedby="ssh-login-hint"
          @input="touched = true"
        />
        <small
          v-if="invalid"
          id="ssh-login-hint"
          class="sl-field__hint sl-field__hint--error"
          role="alert"
          >{{ t("home.sshLogin.invalid") }}</small
        >
      </label>
    </form>
    <template #footer>
      <button type="button" class="sl-btn-secondary" @click="open = false">
        {{ t("common.cancel") }}
      </button>
      <button
        type="button"
        class="sl-btn-primary"
        :disabled="!trimmed || invalid"
        @click="submit"
      >
        {{ t("home.sshLogin.confirm") }}
      </button>
    </template>
  </AppDialog>
</template>

<style scoped lang="scss">
.ssh-login {
  display: grid;
  gap: $spacing-16;
  line-height: $line-height-base;
}

.ssh-login__machine {
  color: var(--color-text-primary);
  font-weight: $font-weight-500;
}
</style>
