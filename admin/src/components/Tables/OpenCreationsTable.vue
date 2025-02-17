<template>
  <div class="open-creations-table">
    <b-table-lite
      :items="items"
      :fields="fields"
      caption-top
      striped
      hover
      stacked="md"
      :tbody-tr-class="rowClass"
    >
      <template #cell(status)="row">
        <b-icon :icon="getStatusIcon(row.item.status)"></b-icon>
      </template>
      <template #cell(bookmark)="row">
        <div v-if="!myself(row.item)">
          <b-button
            variant="danger"
            size="md"
            @click="$emit('show-overlay', row.item, 'delete')"
            class="mr-2"
          >
            <b-icon icon="trash" variant="light"></b-icon>
          </b-button>
        </div>
      </template>
      <template #cell(editCreation)="row">
        <div v-if="!myself(row.item)">
          <b-button
            v-if="row.item.moderatorId"
            variant="info"
            size="md"
            :index="0"
            @click="rowToggleDetails(row, 0)"
            class="mr-2"
          >
            <b-icon :icon="row.detailsShowing ? 'x' : 'pencil-square'" aria-label="Help"></b-icon>
          </b-button>
          <b-button v-else @click="rowToggleDetails(row, 0)">
            <b-icon icon="chat-dots"></b-icon>
            <b-icon
              v-if="row.item.status === 'PENDING' && row.item.messagesCount > 0"
              icon="exclamation-circle-fill"
              variant="warning"
            ></b-icon>
            <b-icon
              v-if="row.item.status === 'IN_PROGRESS' && row.item.messagesCount > 0"
              icon="question-diamond"
              variant="warning"
              class="pl-1"
            ></b-icon>
          </b-button>
        </div>
      </template>
      <template #cell(chatCreation)="row">
        <b-button v-if="row.item.messagesCount > 0" @click="rowToggleDetails(row, 0)">
          <b-icon icon="chat-dots"></b-icon>
        </b-button>
      </template>
      <template #cell(deny)="row">
        <div v-if="!myself(row.item)">
          <b-button
            variant="warning"
            size="md"
            @click="$emit('show-overlay', row.item, 'deny')"
            class="mr-2"
          >
            <b-icon icon="x" variant="light"></b-icon>
          </b-button>
        </div>
      </template>
      <template #cell(confirm)="row">
        <div v-if="!myself(row.item)">
          <b-button
            variant="success"
            size="md"
            @click="$emit('show-overlay', row.item, 'confirm')"
            class="mr-2"
          >
            <b-icon icon="check" scale="2" variant=""></b-icon>
          </b-button>
        </div>
      </template>
      <template #row-details="row">
        <row-details
          :row="row"
          type="show-creation"
          slotName="show-creation"
          :index="0"
          @row-toggle-details="rowToggleDetails(row, 0)"
        >
          <template #show-creation>
            <div v-if="row.item.moderatorId">
              <edit-creation-formular
                type="singleCreation"
                :item="row.item"
                :row="row"
                :creationUserData="creationUserData"
                @update-creation-data="$emit('update-contributions')"
              />
            </div>
            <div v-else>
              <contribution-messages-list
                :contributionId="row.item.id"
                :contributionStatus="row.item.status"
                :contributionUserId="row.item.userId"
                @update-status="updateStatus"
              />
            </div>
          </template>
        </row-details>
      </template>
    </b-table-lite>
  </div>
</template>

<script>
import { toggleRowDetails } from '../../mixins/toggleRowDetails'
import RowDetails from '../RowDetails'
import EditCreationFormular from '../EditCreationFormular'
import ContributionMessagesList from '../ContributionMessages/ContributionMessagesList'

const iconMap = {
  IN_PROGRESS: 'question-square',
  PENDING: 'bell-fill',
  CONFIRMED: 'check',
  DELETED: 'trash',
  DENIED: 'x-circle',
}

export default {
  name: 'OpenCreationsTable',
  mixins: [toggleRowDetails],
  components: {
    EditCreationFormular,
    RowDetails,
    ContributionMessagesList,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
  },
  methods: {
    myself(item) {
      return item.userId === this.$store.state.moderator.id
    },
    getStatusIcon(status) {
      return iconMap[status] ? iconMap[status] : 'default-icon'
    },
    rowClass(item, type) {
      if (!item || type !== 'row') return
      if (item.status === 'CONFIRMED') return 'table-success'
      if (item.status === 'DENIED') return 'table-warning'
      if (item.status === 'DELETED') return 'table-danger'
      if (item.status === 'IN_PROGRESS') return 'table-primary'
      if (item.status === 'PENDING') return 'table-primary'
    },
    updateStatus(id) {
      this.$emit('update-status', id)
    },
  },
}
</script>
<style>
.btn-warning {
  background-color: #e1a908;
  border-color: #e1a908;
}
</style>
