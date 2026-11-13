<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Expense</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <EntryForm kind="expense" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue'
import EntryForm from '@/components/EntryForm.vue'
</script>
