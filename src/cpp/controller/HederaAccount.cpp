
#include "HederaAccount.h"

namespace controller {

	HederaAccount::HederaAccount(model::table::HederaAccount* dbModel)
	{
		mDBModel = dbModel;
	}

	HederaAccount::~HederaAccount()
	{

	}

	Poco::AutoPtr<HederaAccount> HederaAccount::create(int user_id, int account_hedera_id, int account_key_id, Poco::UInt64 balance/* = 0*/, model::table::HederaNetworkType type/* = HEDERA_MAINNET*/)
	{
		auto db = new model::table::HederaAccount(user_id, account_hedera_id, account_key_id, balance, type);
		auto group = new HederaAccount(db);
		return Poco::AutoPtr<HederaAccount>(group);
	}

	std::vector<Poco::AutoPtr<HederaAccount>> HederaAccount::load(const std::string& fieldName, int fieldValue)
	{
		auto db = new model::table::HederaAccount();
		auto hedera_account_list = db->loadFromDB<int, model::table::HederaAccountTuple>(fieldName, fieldValue, 2);

		std::vector<Poco::AutoPtr<HederaAccount>> resultVector;
		resultVector.reserve(hedera_account_list.size());
		for (auto it = hedera_account_list.begin(); it != hedera_account_list.end(); it++) {
			//mHederaID
			auto db = new model::table::HederaAccount(*it);
			auto hedera_account = new HederaAccount(db);
			hedera_account->mHederaID = HederaId::load(db->getAccountHederaId());
			resultVector.push_back(hedera_account);
		}
		return resultVector;
	}

	std::vector<Poco::AutoPtr<HederaAccount>> HederaAccount::listAll()
	{
		auto db = new model::table::HederaAccount();
		std::vector<model::table::HederaAccountTuple> group_list;
		// throw an unresolved external symbol error
		//group_list = db->loadAllFromDB<model::table::GroupTuple>();

		// work around for not working call to loadAllFromDB
		auto cm = ConnectionManager::getInstance();
		Poco::Data::Statement select(cm->getConnection(CONNECTION_MYSQL_LOGIN_SERVER));

		select << "SELECT id, alias, name, url, description FROM " << db->getTableName()
			, Poco::Data::Keywords::into(group_list);

		size_t resultCount = 0;
		try {
			resultCount = select.execute();
		}
		catch (Poco::Exception& ex) {
			printf("[Group::listAll] poco exception: %s\n", ex.displayText().data());
		}
		// work around end
		std::vector<Poco::AutoPtr<HederaAccount>> resultVector;

		resultVector.reserve(group_list.size());
		for (auto it = group_list.begin(); it != group_list.end(); it++) {
			Poco::AutoPtr<HederaAccount> group_ptr(new HederaAccount(new model::table::HederaAccount(*it)));
			resultVector.push_back(group_ptr);
		}
		return resultVector;
	}

}

