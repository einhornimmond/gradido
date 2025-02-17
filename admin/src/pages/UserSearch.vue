<template>
  <div class="user-search">
    <div class="user-search-first-div">
      <b-button class="unconfirmedRegisterMails" variant="light" @click="unconfirmedRegisterMails">
        <b-icon icon="envelope" variant="danger"></b-icon>
        {{
          filters.byActivated === null
            ? $t('all_emails')
            : filters.byActivated === false
            ? $t('unregistered_emails')
            : ''
        }}
      </b-button>
      <b-button class="deletedUserSearch" variant="light" @click="deletedUserSearch">
        <b-icon icon="x-circle" variant="danger"></b-icon>
        {{
          filters.byDeleted === null
            ? $t('all_emails')
            : filters.byDeleted === true
            ? $t('deleted_user')
            : ''
        }}
      </b-button>
    </div>
    <label>{{ $t('user_search') }}</label>
    <user-query class="mb-4 mt-2" v-model="criteria" />
    <search-user-table
      type="PageUserSearch"
      :items="searchResult"
      :fields="fields"
      @updateIsAdmin="updateIsAdmin"
      @updateDeletedAt="updateDeletedAt"
    />
    <b-pagination
      pills
      size="lg"
      v-model="currentPage"
      :per-page="perPage"
      :total-rows="rows"
      align="center"
      :hide-ellipsis="true"
    ></b-pagination>
    <div></div>
  </div>
</template>
<script>
import SearchUserTable from '../components/Tables/SearchUserTable'
import { searchUsers } from '../graphql/searchUsers'
import { creationMonths } from '../mixins/creationMonths'
import UserQuery from '../components/UserQuery'

export default {
  name: 'UserSearch',
  mixins: [creationMonths],
  components: {
    SearchUserTable,
    UserQuery,
  },
  data() {
    return {
      showArrays: false,
      searchResult: [],
      criteria: '',
      filters: {
        byActivated: null,
        byDeleted: null,
      },
      rows: 0,
      currentPage: 1,
      perPage: 25,
      now: Date.now(),
    }
  },
  methods: {
    unconfirmedRegisterMails() {
      this.filters.byActivated = this.filters.byActivated === null ? false : null
      this.getUsers()
    },
    deletedUserSearch() {
      this.filters.byDeleted = this.filters.byDeleted === null ? true : null
      this.getUsers()
    },
    getUsers() {
      this.$apollo
        .query({
          query: searchUsers,
          variables: {
            query: this.criteria,
            filters: this.filters,
            currentPage: this.currentPage,
            pageSize: this.perPage,
            order: 'DESC',
          },
          fetchPolicy: 'no-cache',
        })
        .then((result) => {
          this.rows = result.data.searchUsers.userCount
          this.searchResult = result.data.searchUsers.userList
        })
        .catch((error) => {
          this.toastError(error.message)
        })
    },
    updateIsAdmin(userId, isAdmin) {
      this.searchResult.find((obj) => obj.userId === userId).isAdmin = isAdmin
    },
    updateDeletedAt(userId, deletedAt) {
      this.searchResult.find((obj) => obj.userId === userId).deletedAt = deletedAt
      this.toastSuccess(deletedAt ? this.$t('user_deleted') : this.$t('user_recovered'))
    },
  },
  watch: {
    currentPage() {
      this.getUsers()
    },
    criteria() {
      this.getUsers()
    },
  },
  computed: {
    fields() {
      return [
        { key: 'email', label: this.$t('e_mail') },
        { key: 'firstName', label: this.$t('firstname') },
        { key: 'lastName', label: this.$t('lastname') },
        {
          key: 'creation',
          label: this.creationLabel,
          formatter: (value, key, item) => {
            return value.join(' | ')
          },
        },
        // { key: 'show_details', label: this.$t('details') },
        // { key: 'confirm_mail', label: this.$t('confirmed') },
        // { key: 'has_elopage', label: 'elopage' },
        // { key: 'transactions_list', label: this.$t('transaction') },
        { key: 'status', label: this.$t('status') },
      ]
    },
  },
  created() {
    this.getUsers()
  },
}
</script>
<style>
.user-search-first-div {
  text-align: right;
}
</style>
