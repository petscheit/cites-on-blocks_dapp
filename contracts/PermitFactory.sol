pragma solidity ^0.4.23;


/**
 * @title PermitFactory contract
 * @dev Contains all CITES permit related functions.
 */
contract PermitFactory {

  enum PermitTypes {
    EXPORT,
    RE_EXPORT,
    OTHER
  }
  
  struct Permit {
    address exporter; // address of export authority
    address importer; // address of import authority
    uint8 permitType; // type of permit: 1 -> Export, 2 -> Re-Export, 3 -> Other
    bytes32[3] exNameAndAddress; // name and address of exporter: ["name", "street", "city"]
    bytes32[3] imNameAndAddress; // name and address of importer: ["name", "street", "city"]
    bytes32[] specimenHashes; // hashes of specimens
    uint nonce; // used to create unique hash
  }
  
  struct Specimen {
    bytes32 permitHash; // hash of parent permit
    uint quantity; // quantity of specimen
    bytes32 scientificName; // scientific name of species
    bytes32 commmonName; // common name of specied
    bytes32 description; // description of specimen
    bytes32 originHash; // permit hash of origin permit
    bytes32 reExportHash; // permit hash of last re-export
  }
  
  uint permitNonce = 0; // used to generate unique hash
  mapping (bytes32 => Permit) public permits; // maps hash to permit
  mapping (bytes32 => Specimen) public specimens; // maps hash to specimen

  event PermitCreated (
    bytes32 indexed permitHash,
    address indexed exporter,
    address indexed importer
  );
  
  /**
   * @dev Creates a CITES permit and stores it in the contract.
   * @dev A hash of the permit is used as an unique key.
   * @param _importer address of CITES authority in importing country
   * @param _permitType type of permit: 1 -> Export, 2 -> Re-Export, 3 -> Other
   * @param _exNameAndAddress name and address of exporter: ["name", "street", "city"]
   * @param _imNameAndAddress name and address of importer: ["name", "street", "city"]
   * @param _quantities quantities of specimens
   * @param _scientificNames sc. names of specimens
   * @param _commonNames common names of specimens
   * @param _descriptions specimen descriptions
   * @param _originHashes hashes of origin permits of specimens
   * @param _reExportHashes hashes of last re-export permits of specimens
   * @return whether permit creation was successful
   */
  function createPermit(
    address _importer,
    uint8 _permitType,
    bytes32[3] _exNameAndAddress,
    bytes32[3] _imNameAndAddress,
    uint[] _quantities,
    bytes32[] _scientificNames,
    bytes32[] _commonNames,
    bytes32[] _descriptions,
    bytes32[] _originHashes,
    bytes32[] _reExportHashes
  )
    public
    // TODO modifiers
    returns (bool)
  {
    Permit memory permit = Permit({
      exporter: msg.sender,
      importer: _importer,
      permitType: _permitType,
      exNameAndAddress: _exNameAndAddress,
      imNameAndAddress: _imNameAndAddress,
      specimenHashes: new bytes32[](_quantities.length),
      nonce: permitNonce
    });
    bytes32 permitHash = getPermitHash(
      permit.exporter,
      permit.importer,
      permit.permitType,
      permit.exNameAndAddress,
      permit.imNameAndAddress,
      permit.nonce
    );
    permits[permitHash] = permit;
    addSpecimens(
      permitHash,
      _quantities,
      _scientificNames,
      _commonNames,
      _descriptions,
      _originHashes,
      _reExportHashes
    );
    emit PermitCreated(
      permitHash,
      permit.exporter,
      permit.importer
    );
    permitNonce++;    
    return true;
  }

  /**
   * @dev Helper function that creates specimens and stores them in the contract.
   * @dev Also adds created specimens to related permit.
   * @param _permitHash hash of related permit
   * @param _quantities quantities of specimens
   * @param _scientificNames sc. names of specimens
   * @param _commonNames common names of specimens
   * @param _descriptions specimen descriptions
   * @param _originHashes hashes of origin permits of specimens
   * @param _reExportHashes hashes of last re-export permits of specimens
   * @return whether specimens were added successfully
   */
  function addSpecimens(
    bytes32 _permitHash,
    uint[] _quantities,
    bytes32[] _scientificNames,
    bytes32[] _commonNames,
    bytes32[] _descriptions,
    bytes32[] _originHashes,
    bytes32[] _reExportHashes
  )
    private
    returns (bool)
  {
    for (uint i = 0; i < _quantities.length; i++) {
      Specimen memory specimen = Specimen(
        _permitHash,
        _quantities[i],
        _scientificNames[i],
        _commonNames[i],
        _descriptions[i],
        _originHashes[i],
        _reExportHashes[i]
      );
      bytes32 specimenHash = getSpecimenHash(
        specimen.permitHash,
        specimen.quantity,
        specimen.scientificName,
        specimen.commmonName,
        specimen.description,
        specimen.originHash,
        specimen.reExportHash
      );
      permits[_permitHash].specimenHashes.push(specimenHash);
      specimens[specimenHash] = specimen;
    }
    return true;
  }

  /**
   * @dev Returns unique hash of permit.
   * @param _exporter address of CITES authoriy in exporting country
   * @param _importer address of CITES authority in importing country
   * @param _permitType type of permit: 1 -> Export, 2 -> Re-Export, 3 -> Other
   * @param _exNameAndAddress name and address of exporter: ["name", "street", "city"]
   * @param _imNameAndAddress name and address of importer: ["name", "street", "city"]
   * @param _nonce number used to create unique hash
   * @return unique permit hash
   */
  function getPermitHash(
    address _exporter,
    address _importer,
    uint8 _permitType,
    bytes32[3] _exNameAndAddress,
    bytes32[3] _imNameAndAddress,
    uint _nonce
  ) 
    public
    pure
    returns (bytes32)
  {
    return keccak256(
      _exporter,
      _importer,
      _permitType,
      _exNameAndAddress,
      _imNameAndAddress,
      _nonce
    );
  }

  /**
   * @dev Returns unique hash of specimen.
   * @param _permitHash hash parent permit
   * @param _quantity quantity of specimen
   * @param _scientificName sc. name of specimen
   * @param _commonName common name of specimen
   * @param _description description of specimen
   * @param _originHash hash of origin permit of specimen
   * @param _reExportHash hash of last re-export permit of specimen
   * @return unique specimen hash
   */
  function getSpecimenHash(
    bytes32 _permitHash,
    uint _quantity,
    bytes32 _scientificName,
    bytes32 _commonName,
    bytes32 _description,
    bytes32 _originHash,
    bytes32 _reExportHash
  ) 
    public
    pure
    returns (bytes32)
  {
    return keccak256(
      _permitHash,
      _quantity,
      _scientificName,
      _commonName,
      _description,
      _originHash,
      _reExportHash
    );
  }

  /**
   * @dev Custom getter function to retrieve permit from contract storage.
   * @dev Needed because client can not directly get array from mapping.
   * @param permitHash hash of permit
   * @return permit as tuple
   */
  function getPermit(bytes32 permitHash)
    public
    view
    returns (address, address, uint8, bytes32[3], bytes32[3], bytes32[], uint)
  {
    return (
      permits[permitHash].exporter,
      permits[permitHash].importer,
      permits[permitHash].permitType,
      permits[permitHash].exNameAndAddress,
      permits[permitHash].imNameAndAddress,
      permits[permitHash].specimenHashes,
      permits[permitHash].nonce
    );
  }
}