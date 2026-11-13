<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>xProd</ion-title>
        <ion-buttons slot="end">
          <ion-button href="/desk" aria-label="Open ERPNext">
            <ion-icon slot="icon-only" :icon="appsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2 class="welcome">Welcome, {{ session.fullName || session.user }}</h2>

      <ion-list v-if="session.companies.length > 1" lines="full" class="company">
        <ion-item>
          <ion-select
            :value="session.company"
            label="Company"
            label-placement="stacked"
            interface="action-sheet"
            @ion-change="session.setCompany($event.detail.value)"
          >
            <ion-select-option v-for="c in session.companies" :key="c.name" :value="c.name">
              {{ c.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
      <p v-else-if="session.company" class="company-name">{{ session.company }}</p>

      <p v-if="session.loaded && !session.company" class="notice">
        No company found. Ask your administrator for access to a Company.
      </p>
      <p v-else-if="session.loaded && !session.canCreate" class="notice">
        You do not have permission to create Journal Entries.
      </p>

      <div class="cards">
        <ion-card button router-link="/expense" class="action" :disabled="!ready">
          <ion-card-content>
            <ion-icon :icon="arrowDownCircle" color="danger" class="big-icon" />
            <div class="action-title">New Expense</div>
          </ion-card-content>
        </ion-card>
        <ion-card button router-link="/income" class="action" :disabled="!ready">
          <ion-card-content>
            <ion-icon :icon="arrowUpCircle" color="success" class="big-icon" />
            <div class="action-title">New Income</div>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="logout">
        <ion-button fill="clear" color="danger" @click="session.logout()">Logout</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/vue'
import { appsOutline, arrowDownCircle, arrowUpCircle } from 'ionicons/icons'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const ready = computed(() => !!session.company && session.canCreate)
</script>

<style scoped>
.welcome {
  margin: 8px 4px 16px;
  font-weight: 600;
}
.company {
  margin-bottom: 16px;
}
.company-name {
  margin: -8px 4px 16px;
  color: var(--ion-color-medium);
}
.notice {
  margin: 0 4px 16px;
  color: var(--ion-color-danger);
}
.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.action {
  margin: 0;
  text-align: center;
}
.action ion-card-content {
  padding: 28px 8px;
}
.big-icon {
  font-size: 64px;
}
.action-title {
  margin-top: 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--ion-text-color);
}
.logout {
  margin-top: 32px;
  text-align: center;
}
</style>
