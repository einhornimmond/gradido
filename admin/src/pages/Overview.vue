<template>
  <div class="admin-overview">
    <b-card
      v-show="$store.state.openCreations > 0"
      border-variant="primary"
      :header="$t('open_creations')"
      header-bg-variant="danger"
      header-text-variant="white"
      align="center"
    >
      <b-card-text>
        <b-link to="creation-confirm">
          <h1>{{ $store.state.openCreations }}</h1>
        </b-link>
      </b-card-text>
    </b-card>
    <b-card
      v-show="$store.state.openCreations < 1"
      border-variant="success"
      :header="$t('not_open_creations')"
      header-bg-variant="success"
      header-text-variant="white"
      align="center"
    >
      <b-card-text>
        <b-link to="creation-confirm">
          <h1 data-test="open-creation">{{ $store.state.openCreations }}</h1>
        </b-link>
      </b-card-text>
    </b-card>
  </div>
</template>
<script>
import { adminListContributions } from '../graphql/adminListContributions'

export default {
  name: 'overview',
  data() {
    return {
      statusFilter: ['IN_PROGRESS', 'PENDING'],
    }
  },
  apollo: {
    AllContributions: {
      query() {
        return adminListContributions
      },
      variables() {
        // may be at some point we need a pagination here
        return {
          statusFilter: this.statusFilter,
        }
      },
      update({ adminListContributions }) {
        this.$store.commit('setOpenCreations', adminListContributions.contributionCount)
      },
      error({ message }) {
        this.toastError(message)
      },
    },
  },
}
</script>
