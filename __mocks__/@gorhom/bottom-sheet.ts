const react = require('react-native');
const originalMock = require('@gorhom/bottom-sheet/mock');

originalMock.BottomSheetFlatList = react.FlatList;

module.exports = originalMock;
